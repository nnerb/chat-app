import mongoose from "mongoose"
import cloudinary from "../lib/cloudinary.js"
import { detectUserPreferences } from "../lib/preferenceAnalyzer.js"
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import { getReceiverSocketId, io } from "../socket.js"
import OpenAi from "openai"

export const getUsersForSidebar = async(req, res) => {
  try {
    const loggedInUserId = req.user._id
    const filteredUsers = await User.find({_id: { $ne: loggedInUserId }})
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: chatPartnerId } = req.params;
    const currentUserId = req.user._id
    const LIMIT = 10

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, chatPartnerId] },
    })
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, chatPartnerId],
      });
      await conversation.save();
    }

    await conversation.populate("participants", "fullName profilePic")

    const selectedUser = conversation.participants.find(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(LIMIT);

    messages.reverse()
    
    return res.status(200).json({ 
      messages, 
      conversationId: conversation._id, 
      selectedUser,
      currentPage: 1,
      hasMore: messages.length === LIMIT,
    });
  } catch (error) {
    console.log("Error in getMessages controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const sendMessage = async(req, res) => {
  try {
    const { text, image } = req.body
    const { id: chatPartnerId } = req.params
    const currentUserId = req.user._id

     // Find or create the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, chatPartnerId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, chatPartnerId],
      });
      await conversation.save();
    }

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }
    // Fetch the messages for this conversation, sorted by createdAt
    
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: currentUserId,
      receiverId: chatPartnerId,
      text,
      image: imageUrl
    })

    await newMessage.save()

    const receiverSocketId = getReceiverSocketId(chatPartnerId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }

    const messages = await Message.find({ conversationId: conversation._id })
    .populate("senderId", "fullName profilePic")
    .sort({ createdAt: 1 })

    await detectUserPreferences(currentUserId, conversation._id);

    res.status(201).json({ newMessage, messages })

  } catch (error) {
    console.log("Error in sendMessage controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY })

export const generateReply = async (req, res) => {
  const { selectedMessageId, conversationId } = req.body;
  const currentUserId = req.user._id

  try {

    if (!conversationId ||!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: "Conversation ID is required" });
    }


    if (!selectedMessageId || !mongoose.Types.ObjectId.isValid(selectedMessageId)) {
      return res.status(400).json({ success: false, message: "Invalid selected message ID" });
    }

    // Fetch the selected message
    const selectedMessage = await Message.findById(selectedMessageId);

    if (!selectedMessage) {
      return res.status(404).json({ success: false, message: "Selected message not found" });
    }

    if (selectedMessage.senderId._id.toString() === currentUserId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "The chosen message must be from the receiver, not the sender." 
      });
    }

    // Fetch the last 5 messages before the selected message for context
    const pastMessages = await Message.find({
      conversationId,
      createdAt: { $lt: selectedMessage.createdAt }, // Messages before the selected message
    })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order

    pastMessages.reverse()

    // Fetch user and conversation details
    const user = await User.findById(currentUserId);
    const { fullName } = user;
   
    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "fullName profilePic"
    );

    if (!conversation) {
      return res.status(400).json({ success: false, message: "Conversation not found" });
    }

    // Identify the recipient
    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== currentUserId.toString()
    );

    console.log(conversation)

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    const recipientName = recipient.fullName;

    // Format the messages for the AI
    const formattedHistory = pastMessages.map((msg) => ({
      role: "user", // All past messages are from users
      content: msg.text,
    }));

     // AI system instructions
    const systemPrompt = `
    - You are ${fullName} having a conversation with ${recipientName}. 
    - Your goal is to provide concise, relevant, and polite replies based on the conversation context.
    - Detect if sender normally starts the conversation with capital or small letter.
     Conversation:
      ${formattedHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
      Selected Message: ${selectedMessage.text}
  `;

  // Generate AI reply options
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: selectedMessage.text }, // The selected message
    ],
    n: 3,
    max_tokens: 50,
    temperature: 0.7
  });

  // Extract the reply options (just the message content)
  const replyOptions = response.choices.map((choice) => choice.message.content.trim());

  // Return the reply options as an array of strings
  res.status(201).json({ replyOptions });
  } catch (error) {
    console.log("Error in generateReply controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}


