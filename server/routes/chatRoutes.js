import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
    groupPicUpdate,
    deleteChat,
} from "../controller/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images/profile_pictures"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/grouppic").put(protect, upload.single("groupPic"), groupPicUpdate);
router.route("/accessChat").post(protect, accessChat);
router.route("/fetchChats").get(protect, fetchChats);
router.route("/deleteChat").put(protect, deleteChat);

export default router;
