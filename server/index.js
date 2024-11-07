import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messagesRoute.js";
import chatRoutes from "./routes/chatRoutes.js";

// Configure environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use routes
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);

// API endpoint for uploading files to Cloudinary
app.post("/api/upload", upload.single("attachment"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file from buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "chat_app/attachments" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully");

    // Start server after MongoDB connects
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

    // Socket.io setup after server starts
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
    });

    // Attach Socket.io instance to the app object for access in other files
    app.set("socketio", io);

    // Socket.io connections
    io.on("connection", (socket) => {
      console.log("Connected to socket.io");

      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
      });

      socket.on("contacts", (data) => {
        if (data) {
          socket.emit("contacts", data);
        }
      });

      socket.on("new message", (messageData) => {
        const { chatId } = messageData; // Ensure chatId is available
        if (chatId) {
            socket.to(chatId).emit("message received", messageData); // Send to specific chat room
        }
    });
    

      socket.on("reaction added", (updatedMessage) => {
        io.to(updatedMessage.chat._id).emit("reaction received", updatedMessage);
    });

      socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
      });
    });
  })
  
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
