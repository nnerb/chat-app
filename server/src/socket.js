import { Server } from "socket.io"
import http from "http"
import express from "express"
import User from "./models/user.model.js"
import Message from "./models/message.model.js"
import Conversation from "./models/conversation.model.js"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173']
  }
})

export const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id)
  const userId = socket.handshake.query.userId

  if (userId) {
    userSocketMap[userId] = socket.id
    User.findByIdAndUpdate(userId, { lastSeen: null }, { new: true }).exec();

    // 1. Find the conversation that contains the userId in participants
    const conversations = await Conversation.find({ participants: userId });

    // 2. Prepare bulk operations to update messages in all conversations
    const bulkOps = conversations.map((conversation) => ({
      updateMany: {
        filter: { conversationId: conversation._id, receiverId: userId, status: 'sent' },
        update: { $set: { status: 'delivered' } },
      },
    }));

    if (bulkOps.length) {
      await Message.bulkWrite(bulkOps);
    }
    for (const conversation of conversations) {
      // 3. Identify the sender
      const senderId = conversation.participants.find(id => id.toString() !== userId);
      // 4. If the sender is only, notify them hehe
      if (senderId) {
        const senderSocketId = getReceiverSocketId(senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDelivered", {
            message: "Message delivered in conversation " + conversation._id,
            conversationId: conversation._id,
            status: 'delivered'
          })
          console.log(`Notified sender ${senderId} about delivered messages in conversation ${conversation._id}`);
        }
      }
    }
  }

  socket.on("joinConversation", async (conversationId) => {
    socket.join(conversationId);
  });
  
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  // io.emit used to send events to all connected clients or broadcasting it
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

   // Listen for typing event
  socket.on("typing", ({ senderId, conversationId }) => {
    console.log(`🔵 Server received 'typing' event from ${senderId} in conversation ${conversationId}`);
    // Emit to the correct room
    socket.to(conversationId).emit("userTyping", { senderId });
    console.log(`🟢Server emitting 'userTyping' to room ${conversationId} with senderId: ${senderId}`);
  });

  socket.on("stopTyping", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("userStoppedTyping", { senderId });
  });

  socket.on("disconnect", async() => {
    console.log('A user is disconnected', socket.id)
    if (userId) {
      // Update the user's lastSeen timestamp when they disconnect
      User.findByIdAndUpdate(userId, { lastSeen: Date.now() }, { new: true }).exec();
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})

export { io, app, server }