import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import { fetchChatsRoute } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import { getSender, getSenderProfilePic } from "../config/ChatLogics";
import GroupChatCreate from "./Group/CreateGroupChat";
import UserAvatar from "./UserAvatar";

function Contacts({ fetchAgain, selectedChat, socket }) {
  const { setSelectedChat, chats, user, setChats } = ChatState();
  const [loading, setLoading] = useState(false);
  const [modalActive, setModalActive] = useState("not");

  const fetchChats = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(fetchChatsRoute, config);
      setChats(data);
    } catch (error) {
      toast.error("Failed to load the chats", toastOptions);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("user-status-changed", (updatedUser) => {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.users.some((u) => u._id === updatedUser._id)
              ? {
                  ...chat,
                  users: chat.users.map((u) =>
                    u._id === updatedUser._id
                      ? { ...u, isOnline: updatedUser.isOnline } // Update online status
                      : u
                  ),
                }
              : chat
          )
        );
      });

      socket.current.on("user-deleted", (deletedUserId) => {
        setChats((prevChats) =>
          prevChats.filter((chat) => !chat.users.some((u) => u._id === deletedUserId))
        );
      });

      socket.current.on("message received", (newMessage) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === newMessage.chatId) {
              chat.latestMessage = newMessage; // Update latest message in the chat
            }
            return chat;
          });
        });
      });
    }

    return () => {
      socket.current.off("user-status-changed");
      socket.current.off("user-deleted");
      socket.current.off("message received");
    };
  }, [socket]);

  return (
    <>
      <div className="contacts-container">
        <div>
          {chats && chats.length > 0 ? (
            <div className="contacts">
              {chats.map((chat) => (
                <div
                  onClick={() => setSelectedChat(chat)}
                  key={chat._id}
                  className={`contact ${selectedChat === chat ? "selected" : ""}`}
                >
                  <div className="avatar">
                    {chat.isGroupChat ? (
                      <img src={chat.groupPic} alt={chat.chatName} />
                    ) : (
                      <>
                        <UserAvatar
                          username={getSender(user, chat.users) || "Unknown User"}
                          profilePic={getSenderProfilePic(user, chat.users)}
                          avatarColor={
                            chat.users.find((u) => u._id !== user._id)?.avatarColor || "#ccc"
                          }
                        />
                        {chat.users.find((u) => u._id !== user._id)?.isOnline && (
                          <span className="online-indicator"></span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="grid-wrapper">
                    <h4 className="chat-name">
                      {chat.isGroupChat ? chat.chatName : getSender(user, chat.users)}
                    </h4>
                    {chat.latestMessage && (
                      <span className="time">
                        {new Date(chat.latestMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                          ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                          : new Date(chat.latestMessage.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {chat.latestMessage && (
                      <div className="latest-message">
                        <span className="sender">
                          {chat.latestMessage.sender.username}:
                        </span>
                        <span className="content">
                          {chat.latestMessage.content.length > 0
                            ? chat.latestMessage.content.slice(0, 21) + "..."
                            : "Photo"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-group-chat" onClick={() => setModalActive("active")}>
                <button className="icon-button">+</button>
                <span className="tooltiptext">New group chat</span>
              </div>
            </div>
          ) : loading ? (
            <div className="spinner-container chat-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="chat-loading">
              <b>Your chat list is empty</b>
            </div>
          )}
        </div>
      </div>
      {modalActive === "active" && <GroupChatCreate setModalActive={setModalActive} />}
      <ToastContainer />
    </>
  );
}

export default Contacts;
