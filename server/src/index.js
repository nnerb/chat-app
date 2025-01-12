import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

// Database connection function
import { connectDB } from "./lib/db.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001


app.use(express.json()) // allows to extract json data in the body
app.use(cookieParser()) // allows you to parse the cookie so you can grab the value of it
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)


app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT)
  connectDB()
})