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
    minLength: 6,
  },
  profilePic: {
    type: String,
    default: ""
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, { 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
})

// Virtual property to check if the account is currently locked
userSchema.virtual('isLocked').get(function() {
  // If lockUntil is set and in the future, the account is locked
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model("User", userSchema)

export default User