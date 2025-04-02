import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { createConversation, getConversation } from "../controllers/conversation.controller.js"

const router = express.Router()

router.get("/", protectRoute, getConversation)
router.post("/", protectRoute, createConversation)


export default router