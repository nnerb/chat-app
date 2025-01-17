import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { getConversation } from "../controllers/conversation.controller.js"

const router = express.Router()

router.get("/:id", protectRoute, getConversation)

export default router