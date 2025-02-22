import mongoose from "mongoose"
import cloudinary from "../lib/cloudinary.js"
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import { getReceiverSocketId, io } from "../socket.js"
import OpenAi from "openai"

export const getUsersForSidebar = async(req, res) => {
  try {
    const loggedInUserId = req.user._id
    const filteredUsers = await User.find({_id: { $ne: loggedInUserId }})
    const conversations = await Conversation.find({ participants: loggedInUserId })
    const conversationIds = conversations.map((conversation) => conversation._id)

     // Fetch the last message for each conversation
     const lastMessages = await Message.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      { $sort: { createdAt: -1 } }, // Sort messages by newest first
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { 
            $first: { 
              text: "$text", 
              image: "$image", 
              senderId: "$senderId", 
              createdAt: "$createdAt" 
            } 
          }
        },
      },
    ]);

   // Convert lastMessages to a map for quick lookup
   const lastMessageMap = new Map(lastMessages.map((msg) => [msg._id.toString(), msg.lastMessage]));

    // Step 5: Map all users and associate them with their last message if applicable
    const usersWithLastMessage = filteredUsers.map((user) => {
      // Check if the user is part of any conversation with the logged-in user
      const conversation = conversations.find((conv) =>
        conv.participants.includes(user._id)
      );

      // Get the last message for the conversation, if it exists
      const lastMessageData = conversation ? lastMessageMap.get(conversation._id.toString()) : null;

      return {
        _id: user._id,
        name: user.fullName,
        profilePicture: user.profilePic,
        conversationId: conversation ? conversation._id : null,
        lastMessage: lastMessageData
          ? {
              content: lastMessageData.text || "[Image]", // Show "[Image]" if the message contains an image
              sender: lastMessageData.senderId,
              timestamp: lastMessageData.createdAt,
            }
          : null,
      };
    });
    // Step 6: Return the list of users with their last message data (if any)
    res.status(200).json(usersWithLastMessage);

  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params; 
    const currentUserId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.error("Invalid ObjectId format:", conversationId);
      return res.status(400).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const conversation = await Conversation.findById(conversationId)
    .populate("participants", "fullName profilePic lastSeen");

    if (!conversation) {
      console.log('Conversation not found')
      return res.status(400).json({
        success: false,
        message: "Conversation not found",
      });
    }
  
    const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    messages.reverse()
    
    const selectedUser = conversation.participants.find(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    if (!selectedUser) {
      return res.status(404).json({ success: false, message: "Selected user not found" });
    }

    return res.status(200).json({
      conversation,
      messages,
      selectedUser,
      currentPage: parseInt(page),
      hasMore: messages.length === parseInt(limit),
    });
  } catch (error) {
    console.log("Error in getMessages controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendMessage = async(req, res) => {
  try {
    const { text, image } = req.body
    const { id: chatPartnerId } = req.params
    const currentUserId = req.user._id

     // Find or create the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, chatPartnerId] },
    });


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
      io.to(receiverSocketId).emit("lastMessage", newMessage)
    }

    const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(10)

    messages.reverse()

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

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(400).json({ success: false, message: "Conversation not found" });
    }
    const aiGeneratedRepliesCount = conversation.aiGenerateRepliesCount.get(currentUserId.toString()) || 0;
   
    // Check AI reply limit for the current user
    if (aiGeneratedRepliesCount >= 3) {
      return res.status(403).json({
        success: false,
        message: "You've used all 3 AI replies for this conversation.",
      });
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

    // Identify the recipient
    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== currentUserId.toString()
    );

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
    - Format response **exactly** like this:
      ["Reply 1", "Reply 2", "Reply 3"]

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
    max_tokens: 100,
    temperature: 0.9,
    top_p: 0.8, // Nucleus sampling (more diverse responses)
    frequency_penalty: 0.6, // Discourage repeated phrases
    presence_penalty: 0.4 // Encourage new words/ideas
  });

  // // Increment the AI reply count
  await Conversation.updateOne(
    { _id: conversationId },
    { $inc: { [`aiGenerateRepliesCount.${currentUserId}`]: 1 } } 
  );

  // Extract and parse the reply options (just the message content)
  const replyOptions = JSON.parse(response.choices[0].message.content);

  const updatedAiGeneratedRepliesCount = aiGeneratedRepliesCount + 1;
  // Return the reply options as an array of strings
  res.status(201).json({ replyOptions, updatedAiGeneratedRepliesCount });
  } catch (error) {
    console.log("Error in generateReply controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}


