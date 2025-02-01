import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlenght: 6
  },
  profilePic: {
    type: String,
    default: ""
  },
  // AI Preferences for Chat Customization
  aiPreferences: {
    chatStyle: {
      type: [String],
      enum: ["Casual", "Funny", "Formal", "Friendly", "Serious"],
    },
    favoriteWords: {
      type: [String], // Array to store frequently used words
      default: [],
    },
    favoriteEmojis: {
      type: [String], // Array to store frequently used emojis
      default: [],
    },
    trained: {
      type: Boolean, // If user has AI-trained preferences
      default: false,
    },
  },
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User