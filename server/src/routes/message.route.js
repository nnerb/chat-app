import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { getMessages, sendMessage, generateReply } from "../controllers/message.controller.js"

const router = express.Router()

router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessage)
router.post("/generate-reply", protectRoute, generateReply )

export default router