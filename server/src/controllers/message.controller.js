import cloudinary from "../lib/cloudinary.js"
import Conversation from "../models/converstion.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

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
    const { id: chatPartnerId } = req.params; // ID of the user you're chatting with
    const currentUserId = req.user._id; // Logged-in user's ID

    // Find or create the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, chatPartnerId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, chatPartnerId],
      });
      await conversation.save();
    }

    // Now fetch messages for this conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "fullName profilePic") // Populate sender details
      .sort({ createdAt: 1 }); // Sort by creation date (oldest first)

    return res.status(200).json(messages); // Return messages in the conversation
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

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId: currentUserId,
      receiverId: chatPartnerId,
      text,
      image: imageUrl
    })

    await newMessage.save()
    res.status(201).json(newMessage)

  } catch (error) {
    console.log("Error in sendMessage controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId: partnerId } = req.params; // The ID of the clicked user
    const currentUserId = req.user._id; // The logged-in user's ID

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    });

    if (!conversation) {
      // Create a new conversation
      conversation = new Conversation({
        participants: [currentUserId, partnerId],
      });
      await conversation.save();
    }

    res.status(200).json(conversation); // Return the conversation
  } catch (error) {
    console.log("Error in getOrCreateConversation controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};