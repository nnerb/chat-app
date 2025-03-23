import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation", // References the Conversation model
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent", // Default status when message is created
  },
}, { timestamps: true })

const Message = mongoose.model("Message", messageSchema)

export default Message