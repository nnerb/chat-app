import express from "express"
import { login, logout, signup, updateProfile, removeProfilePic, checkAuth } from "../controllers/auth.controller.js"
import protectRoute from "../middleware/auth.middleware.js"
import { rateLimit } from "express-rate-limit"

const router = express.Router()

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each email to 5 attempts per 15 minutes
  message: { success: false, message: "Too many attempts. Try again later." },
  keyGenerator: (req) => req.body.email || "unknown", // Use email as key
});

router.post("/signup", signup)
router.post("/login", emailLimiter, login)
router.post("/logout/:id", logout)
router.put("/update-profile", protectRoute, updateProfile)
router.put("/remove-profile", protectRoute, removeProfilePic)
router.get("/check", protectRoute, checkAuth)

export default router