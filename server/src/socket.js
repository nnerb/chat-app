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
      const senderId = conversation.participants.find(id => id !== userId);
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
  // io.emit used to send events to all connected clients or broadcasting it
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  socket.on("joinConversation", async (conversationId) => {
    socket.join(conversationId);
  });
  
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("seenMessage", async ({ conversationId }) => {
    try {
      // Update all messages where the current user is the receiver and status is "delivered"
      const result = await Message.updateMany(
        { conversationId, receiverId: userId, status: "delivered" },
        { $set: { status: "seen" } }
      );
      console.log(`Marked ${result.modifiedCount} messages as seen in conversation ${conversationId}`);
  
      // Find the conversation to identify the sender
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const senderId = conversation.participants.find(id => id.toString() !== userId);
        if (senderId) {
          const senderSocketId = getReceiverSocketId(senderId.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", {
              conversationId,
              status: "seen"
            });
            console.log(`Notified sender ${senderId} that messages in conversation ${conversationId} are seen.`);
          }
        }
      }
    } catch (error) {
      console.error("Error in seenMessage event:", error);
    }
  });

   // Listen for typing event
  socket.on("typing", ({ senderId, conversationId }) => {
    socket.to(conversationId).emit("userTyping", { senderId });
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