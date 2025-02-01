// src/utils/preferenceAnalyzer.js

import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import stopword from "stopword"
import emojiRegex from "emoji-regex"

// Function to analyze and detect preferences based on messages
export const detectUserPreferences = async (userId, conversationId) => {
  try {
    // Get the last 10 messages from the conversation to analyze
    const messages = await Message.find({ conversationId, senderId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Initialize default preferences
    let favoriteWords = [];
    let favoriteEmojis = [];
    const emoticonsPattern = /(:\)|:P|<3|:D|:O|:-\))+/g; 
    const regex = emojiRegex();

    // Analyze the messages to detect frequent words, emoticons, and emojis
    messages.forEach((msg) => {
      const messageText = msg.text;

      // Detect frequent words
      const words = messageText.split(/\s+/); // Split the message by spaces
      const filteredWords = stopword.removeStopwords(words)
      const wordFrequency = filteredWords.reduce((acc, word) => {
        if (word.length > 3) {
          acc[word] = (acc[word] || 0) + 1;
        }
        return acc;
      }, {});
      favoriteWords.push(...Object.keys(wordFrequency));

      // Detect emoticons and emojis
      const emoticons = messageText.match(emoticonsPattern); 
      if (emoticons) favoriteEmojis.push(...emoticons);

      const emojis = messageText.match(regex);
      if (emojis) favoriteEmojis.push(...emojis);
    });

    // Remove duplicates and limit array size
    favoriteWords = [...new Set(favoriteWords)].slice(0, 10); // Keep top 10 words
    favoriteEmojis = [...new Set(favoriteEmojis)].slice(0, 5); // Keep top 5 emojis/emoticons

    await User.findByIdAndUpdate(userId, {
      $addToSet: { "aiPreferences.favoriteWords": { $each: favoriteWords } },
      $addToSet: { "aiPreferences.favoriteEmojis": { $each: favoriteEmojis } },
      $set: { "aiPreferences.trained": true },
    });
  
    console.log(`AI preferences updated for user ${userId}`);
  } catch (error) {
    console.error("Error detecting user preferences:", error);
    throw new Error("Failed to detect preferences");
  }
};
