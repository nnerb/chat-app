import express from "express"
import { login, logout, signup, updateProfile, removeProfilePic, checkAuth } from "../controllers/auth.controller.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout/:id", logout)
router.put("/update-profile", protectRoute, updateProfile)
router.put("/remove-profile", protectRoute, removeProfilePic)
router.get("/check", protectRoute, checkAuth)

export default router