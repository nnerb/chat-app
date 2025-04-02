import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket.js";

export const getConversation = async (req, res) => {
  const { partnerId } = req.query; 
  try {
    const currentUserId = req.user._id
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    });
    if (!conversation) return res.status(404).json({ status: false, message: "No conversation yet" }); 
    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in getConversation controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createConversation = async (req, res) => {
  const { participantId } = req.body;
  try {
    const newConvo = await Conversation.create({
      participants: [req.user._id, participantId],
    });
    await newConvo.save();
    const receiverSocketId = getReceiverSocketId(participantId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newConversation", {
        newConvo,
        senderId: req.user._id,
      });
    } 
    res.status(201).json(newConvo);
  } catch (error) {
    console.log("Error in createConversation controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
