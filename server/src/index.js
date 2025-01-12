import express from "express"
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"

// Database connection function
import { connectDB } from "./lib/db.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT)
  connectDB()
})