import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    setUser(userInfo);

    if (userInfo) {
      setUser(userInfo);
      setChats([]); // Clear chats when user is set
    } else {
      setUser(null);
      setChats([]);
      navigate("/auth"); // Redirect to auth page if no user data
    }
  }, [navigate]);

  // Reset function to clear all chat state
  const resetState = () => {
    setSelectedChat(null);
    setNotification([]);
    setChats([]);
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        resetState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
