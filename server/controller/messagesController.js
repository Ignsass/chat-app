import Messages from "../model/messageModel.js";
import User from "../model/userModel.js";
import Chat from "../model/chatModel.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get Messages
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Messages.find({ chat: req.params.chatId })
      .populate("sender", "username profilePic email")
      .populate({
        path: "chat",
        populate: { path: "latestMessage", populate: { path: "sender" } },
      });
    res.json(messages);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// Add Message
export const addMessage = async (req, res) => {
  const { sender, chatId, content, attachment } = req.body;

  if (!chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    const newMessage = {
      sender,
      content,
      chat: chatId,
      attachment: attachment || "", // Ensure attachment is an empty string if null
    };

    let message = await Messages.create(newMessage);

    // Update latest message in the chat
    await Chat.findByIdAndUpdate(
      chatId,
      { latestMessage: message._id },
      { new: true }
    );

    // Populate and return the message
    message = await message.populate("sender", "username profilePic");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username profilePic",
    });
    message = await message.populate({
      path: "chat",
      populate: { path: "latestMessage", populate: { path: "sender" } },
    });

    console.log("Message saved with attachment URL:", message.attachment); // Debugging line
    res.json(message);
  } catch (error) {
    console.error("Failed to save message:", error);
    res.status(500).json({ message: "Failed to save message" });
  }
};
export const addReaction = async (req, res) => {
  const { messageId, emoji } = req.body;
  const userId = req.user._id;

  try {
      const message = await Messages.findById(messageId);
      const existingReaction = message.reactions.find(r => r.user.toString() === userId);

      if (existingReaction) {
          existingReaction.emoji = emoji; // Update reaction
      } else {
          message.reactions.push({ user: userId, emoji }); // Add new reaction
      }

      await message.save();
      res.json({ success: true, message });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
};
