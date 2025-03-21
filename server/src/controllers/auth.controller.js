import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { io } from "../socket.js"

export const signup = async (req, res) => {

  const { fullName, email, password } = req.body

  try {

    if (!email.trim() || !fullName.trim() || !password.trim() ) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const user = await User.findOne({ email })

    if (user) {
      return res.status(409).json({ success: false, message: "Email already exists" })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must at least 6 characters "})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    })

    generateToken(newUser._id, res)
    await newUser.save()
    
    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    })

  } catch (error) {
    console.log("Error in sign up controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}


const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials"})
    }

    if (user.isLocked) {
      return res.status(403).json({ message: 'Account is temporarily locked due to too many failed login attempts.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts and lockUntil on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined; // Clear lockUntil
    user.lastLogin = Date.now();
    await user.save();
    generateToken(user._id, res)
    
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    })

  } catch (error) {
    console.log("Error in login controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const logout = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    user.lastSeen = Date.now()
    await user.save()

     // Emit a WebSocket event to update the lastSeen timestamp in real-time
     io.emit("userLoggedOut", { userId: id, lastSeen: user.lastSeen });
    
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully'
   });
  } catch (error) {
    console.log("Error in logout controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const updateProfile = async(req, res) => {
  try {
    const { profilePic } = req.body
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ success: false, message: "Profile picture is required" })
    }

   const uploadResponse = await cloudinary.uploader.upload(profilePic)
   const updatedUser = await User.findByIdAndUpdate(
    userId, 
    { profilePic: uploadResponse.secure_url},
    { new: true }
  )

   return res.status(200).json({ success: true, user: updatedUser})

  } catch (error) {
    console.log("Error in update profile controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const removeProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the user to get the current profile picture URL
    const user = await User.findById(userId);

    if (!user || !user.profilePic) {
      return res.status(404).json({ success: false, message: "Profile picture not found" });
    }

    // Extract the public ID from the Cloudinary URL if you plan to delete it
    const publicId = user.profilePic.split("/").pop().split(".")[0];

    // Optionally delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Update the user's profile to remove the profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: '' },
      { new: true }
    );

    return res.status(200).json({ success: true, user: updatedUser });
    
  } catch (error) {
    console.error("Error in remove profile picture controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log("Error in check auth controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}