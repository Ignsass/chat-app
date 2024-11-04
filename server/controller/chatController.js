import User from "../model/userModel.js";
import Chat from "../model/chatModel.js";
import Messages from "../model/messageModel.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

// Konfigūruojame „Cloudinary“
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username profilePic",
  });

  const user2 = await User.findById(userId);
  const username = user2.username;

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: username,
      isGroupChat: false,
      groupPic: '',
      users: [req.user._id, userId],
    };
    
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage");
      
      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400);
      throw Error(error.message);
    }
  }
};

export const fetchChats = async (req, res) => {
  try {
    // Patikrink, ar req.user egzistuoja, ir išvengti klaidų
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Toliau vykdyk, jei req.user ir req.user._id egzistuoja
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username profilePic",
    });

    res.status(200).send(populatedChats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  const groupPicUrl = 'default-group.svg';
  const users = JSON.parse(req.body.users);
  
  if (users.length < 1) {
    return res.status(400).send("More than 1 user is required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupPic: groupPicUrl,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
};

export const groupPicUpdate = async (req, res) => {
  const { chatId } = req.body;

  try {
    let groupPicUrl = 'default-group.svg';

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "chat_app/group_pictures" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      groupPicUrl = result.secure_url;
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupPic: groupPicUrl },
      { new: true }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update group picture", error: error.message });
  }
};

export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.body;

  const removed = await Chat.deleteOne({ _id: chatId });
  const removedMessages = await Messages.deleteMany({ chat: chatId });

  if (!removed || !removedMessages) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};
