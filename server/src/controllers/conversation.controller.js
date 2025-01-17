import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js"; // Make sure you import your Message model

export const getConversation = async (req, res) => {
  try {
    const { id: conversationId } = req.params; 
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.error("Invalid ObjectId format:", conversationId);
      return res.status(400).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const conversation = await Conversation.findById(conversationId)
    .populate("participants", "fullName profilePic");
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
    .populate("senderId", "fullName profilePic")
    .sort({ createdAt: 1 })
    
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
    });
  } catch (error) {
    console.log("Error in getConversation controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
