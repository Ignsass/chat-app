import { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { RxExit, RxPencil2 } from "react-icons/rx";
import { GoKebabVertical } from "react-icons/go";
import { ChatState } from "../context/ChatProvider";
import { getSender, getSenderProfilePic } from "../config/ChatLogics";
import UpdateGroupChat from "./Group/UpdateGroupChat";
import SubmitModal from "./Au/SubmitModal";
import SingleChat from "./SingleChat";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { removeGroupChatRoute, deleteChatRoute } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import UserAvatar from "./UserAvatar";

function ChatContainer({ socket, fetchAgain, setFetchAgain }) {
  const { setSelectedChat, selectedChat, user } = ChatState();
  const [showToggle, setShowToggle] = useState(false);
  const [modalUpdateActive, setModalUpdateActive] = useState("not");
  const [modalSubmitActive, setModalSubmitActive] = useState("not");
  const [warnText, setWarnText] = useState("");
  const [submText, setSubmText] = useState("");

  // Real-time updates for username and profile picture changes
  useEffect(() => {
    if (socket.current) {
      socket.current.on("user-updated", (updatedUser) => {
        setSelectedChat((prevChat) => {
          if (!prevChat) return prevChat;

          const updatedUsers = prevChat.users.map((u) => {
            if (u._id === updatedUser._id) {
              // Only update the user that matches the ID
              return {
                ...u,
                username: updatedUser.username,
                profilePic: updatedUser.profilePic || u.profilePic, // Update profile picture only if it's available
              };
            }
            return u;
          });

          return { ...prevChat, users: updatedUsers }; // Update the users array
        });
      });
    }
  }, [socket, setSelectedChat]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showToggle && !e.target.closest(".chat-menu-toggle") && !e.target.closest(".chat-menu")) {
        setShowToggle(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showToggle]);

  const updateChat = () => {
    setModalUpdateActive("active");
    setShowToggle(false);
  };

  const leaveChat = () => {
    setModalSubmitActive("leave");
    setShowToggle(false);
    setWarnText("You cannot return to this chat on your own.");
    setSubmText(`Are you sure you want to leave ${selectedChat.chatName}?`);
  };

  const handleLeave = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(removeGroupChatRoute, { chatId: selectedChat._id, userId: user._id }, config);
      setFetchAgain(!fetchAgain);
      toast.success(`You successfully left ${selectedChat.chatName}`, toastOptions);
      setSelectedChat(); // Clear selected chat
      setModalSubmitActive("not");
    } catch (error) {
      toast.error("Something went wrong! Please try again.", toastOptions);
    }
  };

  const deleteChat = () => {
    setModalSubmitActive("delete");
    setShowToggle(false);
    setWarnText("This action is irreversible. All messages will be permanently deleted.");
    setSubmText(`Are you sure you want to delete the chat with ${selectedChat.chatName}?`);
  };

  const handleDelete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(deleteChatRoute, { chatId: selectedChat._id }, config);
      setFetchAgain(!fetchAgain);
      toast.success("Chat deleted successfully", toastOptions);
      setSelectedChat(); // Clear selected chat
      setModalSubmitActive("not");
    } catch (error) {
      toast.error("Something went wrong! Please try again.", toastOptions);
    }
  };

  return (
    <div className="right-side">
      <div className="chat-header">
        <button className="icon-button" onClick={() => setSelectedChat(undefined)}>
          <IoIosArrowBack />
        </button>
        {selectedChat && (
          <div className="user-details">
            <div className="avatar">
              {selectedChat.isGroupChat ? (
                <img src={selectedChat.groupPic} alt={selectedChat.chatName} className="profile-pic" />
              ) : (
                <UserAvatar
                  username={getSender(user, selectedChat.users)}
                  profilePic={getSenderProfilePic(user, selectedChat.users)}
                  avatarColor={selectedChat.users.find((u) => u._id !== user._id)?.avatarColor || "#ccc"}
                />
              )}
            </div>
            <div className="username">
              <h3>{selectedChat.isGroupChat ? selectedChat.chatName : getSender(user, selectedChat.users)}</h3>
            </div>
          </div>
        )}
        <div className="chat-menu">
          <button
            className={`icon-button ${showToggle ? "transform" : ""}`}
            onClick={() => setShowToggle(!showToggle)}
          >
            <GoKebabVertical />
          </button>
        </div>

        {showToggle && (
          <div className="chat-menu-toggle">
            {selectedChat.isGroupChat ? (
              <>
                <button className="list-item" onClick={updateChat}>
                  <RxPencil2 />
                  <span>Update</span>
                </button>
                <button className="list-item" onClick={leaveChat}>
                  <RxExit />
                  <span>Leave Group</span>
                </button>
              </>
            ) : (
              <button className="list-item" onClick={deleteChat}>
                <RxExit />
                <span>Delete<br />Chat</span>
              </button>
            )}
          </div>
        )}
      </div>
      <SingleChat fetchAgain={fetchAgain} socket={socket} setFetchAgain={setFetchAgain} selectedChat={selectedChat} />

      {modalUpdateActive === "active" && (
        <UpdateGroupChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} setModalActive={setModalUpdateActive} />
      )}
      {modalSubmitActive === "leave" && (
        <SubmitModal
          setModalActive={setModalSubmitActive}
          warnText={warnText}
          submText={submText}
          handleFunction={handleLeave}
        />
      )}
      {modalSubmitActive === "delete" && (
        <SubmitModal
          setModalActive={setModalSubmitActive}
          warnText={warnText}
          submText={submText}
          handleFunction={handleDelete}
        />
      )}
      <ToastContainer />
    </div>
  );
}

export default ChatContainer;
