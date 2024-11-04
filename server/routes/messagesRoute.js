import { Router } from "express";
import multer from "multer";
import { addMessage, getMessages, addReaction } from "../controller/messagesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Multer su `memoryStorage`
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.route("/addmsg/").put(protect, upload.single("attachment"), addMessage);
router.route("/getmsg/:chatId").get(protect, getMessages);
router.put("/addReaction", protect, addReaction);
router.post("/addmsg", protect, addMessage);



export default router;
