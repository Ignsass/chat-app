import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            min: 4,
            max: 20,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
            max: 30,
        },
        profilePic: {
            type: String,
            default: null,
        },
        avatarColor: { 
            type: String, 
            default: '#000000',
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isOnline: { type: Boolean, default: false },
    }
);

export default mongoose.model("User", userSchema);
