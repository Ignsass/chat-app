import { Router } from "express";
import multer from "multer";
import { 
    login, 
    register, 
    getAllUsers, 
    renameUser, 
    emailUpdate, 
    profilePicUpdate, 
    passwordUpdate,
    deleteProfile,
    getUser // Import the new controller function
} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post("/register", upload.single("profilePic"), register);
router.post("/login", login);

router.route("/allUsers").get(protect, getAllUsers);
router.route("/deleteUser").put(protect, deleteProfile);
router.route("/renameUser").put(protect, renameUser);
router.route("/emailUpdate").put(protect, emailUpdate);
router.route("/profilePicUpdate").put(protect, upload.single("profilePic"), profilePicUpdate);
router.route("/passwordUpdate").put(protect, passwordUpdate);
router.route("/getUser").get(protect, getUser); // New route to fetch user profile

export default router;
