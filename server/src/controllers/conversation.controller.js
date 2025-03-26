import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket.js";

export const getConversation = async (req, res) => {
  try {
    const { id: chatPartnerId } = req.params;
    const currentUserId = req.user._id

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, chatPartnerId] },
    })
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, chatPartnerId],
      });
      await conversation.save();
      const receiverSocketId = getReceiverSocketId(chatPartnerId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newConversation", {
          conversation,
          senderId: req.user._id,
        });
      } 
    }

    await conversation.populate("participants", "fullName profilePic")

    const selectedUser = conversation.participants.find(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    return res.status(200).json({ 
      conversation,
      selectedUser,
    });
  } catch (error) {
    console.log("Error in getConversation controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
