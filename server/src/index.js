import express from "express"
import authRoutes from "./routes/auth.route.js"

const app = express()
const PORT = 5001

app.get("/api/auth", authRoutes)

app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT)
})