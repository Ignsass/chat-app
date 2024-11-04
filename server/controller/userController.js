import User from '../model/userModel.js';
import Chat from "../model/chatModel.js";
import Messages from "../model/messageModel.js";
import bcrypt from 'bcrypt';
import cloudinary from 'cloudinary';
import { generateToken } from '../config/generateToken.js';
import generateColor from '../utils/generateColor.js'; // Importuokite generateColor funkciją

// „Cloudinary“ konfigūracija
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // Patikriname, ar vartotojo vardas arba el. paštas jau naudojami
    const usernameCheck = await User.findOne({ username });
    const emailCheck = await User.findOne({ email });

    if (usernameCheck) {
      return res.json({ msg: "The username is already used", status: false });
    }
    if (emailCheck) {
      return res.json({ msg: "The email is already used", status: false });
    }

    let profilePicUrl = 'default.svg';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "chat_app/profile_pictures" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      profilePicUrl = result.secure_url;
    }

    const avatarColor = generateColor(username); // Generuojame spalvą pagal vartotojo vardą
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePic: profilePicUrl,
      avatarColor, // Pridėti generuotą spalvą
    });
    delete user.password;

    return res.json({
      status: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        avatarColor: user.avatarColor, // Grąžiname spalvą atsakyme
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      }
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ msg: "Incorrect username or password", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({ msg: "Incorrect username or password", status: false });
    }

    if (user && isPasswordValid) {
      console.log("User:", user); // Patikrinkite, ar vartotojas egzistuoja
  console.log("Avatar Color:", user.avatarColor); // Patikrinkite, ar avatarColor yra
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        avatarColor: user.avatarColor,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      res.status(401);
    }
  } catch (e) {
    next(e);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? { username: { $regex: req.query.search, $options: "i" } }
      : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  } catch (e) {
    next(e);
  }
};
export const getUser = async (req, res) => {
  try {
      const user = await User.findById(req.user._id).select("username avatarColor profilePic");
      if (!user) return res.status(404).json({ status: false, message: "User not found" });
      res.status(200).json({ status: true, user });
  } catch (error) {
      res.status(500).json({ status: false, message: "Error fetching user data", error });
  }
};
export const updateUsername  = async (req, res) => {
  const { userId, newUsername } = req.body;
  const usernameCheck = await User.findOne({ username: newUsername });

  if (usernameCheck) {
    return res.json({ msg: "The username is already used", status: false });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username: newUsername },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json({
      status: true,
      updatedUser: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      }
    });
  }
};

export const emailUpdate = async (req, res) => {
  const { userId, newEmail } = req.body;
  const emailCheck = await User.findOne({ email: newEmail });

  if (emailCheck) {
    return res.json({ msg: "The email is already used", status: false });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json({
      status: true,
      updatedUser: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      }
    });
  }
};

export const passwordUpdate = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  const user = await User.findOne({ _id: userId });
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    return res.json({ msg: "Incorrect password", status: false });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    delete updatedUser.password;
    res.json({ status: true });
  }
};

// Assume `io` is passed in your app setup, e.g., via `req.app.get('socketio')`
export const renameUser = async (req, res) => {
  const { userId, newUsername } = req.body;
  const usernameCheck = await User.findOne({ username: newUsername });

  if (usernameCheck) {
    return res.json({ msg: "The username is already used", status: false });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username: newUsername },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    // Access and use the Socket.io instance attached to req.app
    req.app.get('socketio').emit("user-updated", { _id: userId, username: newUsername });
    res.json({
      status: true,
      updatedUser: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      }
    });
  }
};


export const profilePicUpdate = async (req, res) => {
  const { userId } = req.body;
  let profilePicUrl = 'default.svg';

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "chat_app/profile_pictures" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    profilePicUrl = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: profilePicUrl }, { new: true });

  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    // Emit an update event with the new profile picture
    req.app.get('socketio').emit("user-updated", { _id: userId, profilePic: profilePicUrl });
    res.json({
      status: true,
      updatedUser: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      }
    });
  }
};

export const deleteProfile = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
    return;
  }

  if (user.profilePic && user.profilePic !== 'default.svg') {
    const publicId = user.profilePic.split('/').pop().split('.')[0];
    await cloudinary.v2.uploader.destroy(`chat_app/profile_pictures/${publicId}`);
  }

  await User.findByIdAndDelete(userId);

  // Notify all clients about the deleted user
  req.app.get('socketio').emit("user-deleted", userId);

  res.json({ status: true });
};
