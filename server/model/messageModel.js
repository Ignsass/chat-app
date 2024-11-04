import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    attachment: {
      type: String,
      default: "",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    reactions: [
      {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          emoji: String,
      },
  ],
  },
  { timestamps: true }
);

export default mongoose.model("Messages", MessageSchema);
