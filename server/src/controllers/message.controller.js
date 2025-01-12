import cloudinary from "../lib/cloudinary.js"
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

export const getMessages = async(req,res) => {
  try {
    const { id: chatPartnerId } = req.params
    const currentUserId = req.user._id

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: currentUserId }
      ]
    })

    return res.status(200).json(messages)

  } catch (error) {
    console.log("Error in getMessages controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

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

  } catch (error) {
    console.log("Error in sendMessage controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}