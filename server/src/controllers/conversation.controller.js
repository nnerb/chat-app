import Conversation from "../models/conversation.model.js";


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
    }

    await conversation.populate("participants", "fullName profilePic")

    const selectedUser = conversation.participants.find(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    return res.status(200).json({ 
      conversationId: conversation._id, 
      selectedUser,
    });
  } catch (error) {
    console.log("Error in getConversation controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
