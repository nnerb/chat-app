import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import conversationRoutes from "./routes/conversation.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./socket.js"
import path from "path"

// Database connection function
import { connectDB } from "./lib/db.js"

dotenv.config()

const PORT = process.env.PORT || 5001
const __dirname = path.resolve()


app.use(express.json({
  limit: '50mb'
})) // allows to extract json data in the body
app.use(cookieParser()) // allows you to parse the cookie so you can grab the value of it
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/conversation", conversationRoutes)
app.use("/api/messages", messageRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))
  })
}


server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT)
  connectDB()
})