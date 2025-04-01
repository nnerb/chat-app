import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsers = async(req, res) => {
  try {
    const loggedInUserId = req.user._id
    const filteredUsers = await User.find({_id: { $ne: loggedInUserId }})
    const conversations = await Conversation.find({ participants: loggedInUserId })
    const conversationIds = conversations.map((conversation) => conversation._id)

     // Fetch the last message for each conversation
     const lastMessages = await Message.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      { $sort: { createdAt: -1 } }, // Sort messages by newest first
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { 
            $first: { 
              text: "$text", 
              image: "$image", 
              senderId: "$senderId", 
              createdAt: "$createdAt" 
            } 
          }
        },
      },
    ]);

   // Convert lastMessages to a map for quick lookup
   const lastMessageMap = new Map(lastMessages.map((msg) => [msg._id.toString(), msg.lastMessage]));

    // Step 5: Map all users and associate them with their last message if applicable
    const usersWithLastMessage = filteredUsers.map((user) => {
      // Check if the user is part of any conversation with the logged-in user
      const conversation = conversations.find((conv) =>
        conv.participants.includes(user._id)
      );

      // Get the last message for the conversation, if it exists
      const lastMessageData = conversation ? lastMessageMap.get(conversation._id.toString()) : null;

      return {
        _id: user._id,
        name: user.fullName,
        profilePicture: user.profilePic,
        conversationId: conversation ? conversation._id : null,
        lastMessage: lastMessageData
          ? {
              content: lastMessageData.text || "[Image]", // Show "[Image]" if the message contains an image
              sender: lastMessageData.senderId,
              timestamp: lastMessageData.createdAt,
            }
          : null,
      };
    });
    // Step 6: Return the list of users with their last message data (if any)
    res.status(200).json({ usersWithLastMessage });

  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}