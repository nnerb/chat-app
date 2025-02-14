import { Server } from "socket.io"
import http from "http"
import express from "express"
import User from "./models/user.model.js"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173']
  }
})

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id)
  const userId = socket.handshake.query.userId

  if (userId) {
    userSocketMap[userId] = socket.id
    User.findByIdAndUpdate(userId, { lastSeen: null }, { new: true }).exec();
  }

  // io.emit used to send events to all connected clients or broadcasting it
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

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