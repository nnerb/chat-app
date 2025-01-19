import cloudinary from "../lib/cloudinary.js"
import Conversation from "../models/conversation.model.js"
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

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 })

    return res.status(200).json({ messages, conversationId: conversation._id, selectedUser });
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

    const messages = await Message.find({ conversationId: conversation._id })
    .populate("senderId", "fullName profilePic")
    .sort({ createdAt: 1 })

    res.status(201).json({ newMessage, messages })

  } catch (error) {
    console.log("Error in sendMessage controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}


