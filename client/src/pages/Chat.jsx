import { useEffect, useState, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { SlMagnifier } from "react-icons/sl";
import { IoIosArrowBack } from "react-icons/io";
import { GrFormClose } from "react-icons/gr";
import { io } from "socket.io-client";
import axios from "axios";

import { ChatState } from "../context/ChatProvider";
import { allUsersRoute, host } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Search from "../components/Search";
import UserInfo from "../components/UserInfo";
import UserAvatar from "../components/UserAvatar"; // Import UserAvatar

function Chat() {
  const socket = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [navState, setNavState] = useState("start");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { selectedChat, user } = ChatState();

  const handleSearch = async () => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${allUsersRoute}?search=${search}`, config);
      setLoading(false);
      setSearchResults(data);
      setNavState("add-trip");
    } catch (error) {
      setLoading(false);
      toast.error("Error in searching user", toastOptions);
    }
  };

  useEffect(() => {
    if (user) {
      socket.current = io(host);
      socket.current.emit("setup", user._id);

      socket.current.on("message received", () => {
        setFetchAgain((prev) => !prev);
      });

      socket.current.on("user-status-changed", (onlineUserIds) => {
        setOnlineUsers(onlineUserIds);
      });

      return () => {
        if (socket.current) socket.current.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat && socket.current) {
      socket.current.emit("join chat", selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(); // Trigger search after user stops typing for a short delay
    }, 300); // Delay time in ms (e.g., 300ms)

    return () => clearTimeout(delayDebounceFn); // Clear the timeout if the user types again
  }, [search]); // Only call this effect when `search` changes

  return (
    <>
      <div className="chat-container">
        {user && (
          <div className="container chat-box">
            <div className="aside">
              <UserInfo fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} onlineUsers={onlineUsers} />
              <div className="wrapper">
                <div className="search__chat">
                  {navState === "add-trip" && search ? (
                    <button className="back" onClick={() => setNavState("start")}>
                      <IoIosArrowBack />
                    </button>
                  ) : (
                    <button type="button" className="search__button" onClick={handleSearch}>
                      <SlMagnifier />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Search or start new chat"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} // Update search input as user types
                  />
                  {search && (
                    <button className="right-button" onClick={() => setSearch("")}>
                      <GrFormClose />
                    </button>
                  )}
                </div>
                <div className="contacts-wrapper">
                  {!search || navState === "start" ? (
                    <Contacts
                      socket={socket}
                      selectedChat={selectedChat}
                      fetchAgain={fetchAgain}
                      onlineUsers={onlineUsers}
                    />
                  ) : loading ? (
                    <div className="spinner-container chat-loading">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : (
                    <Search socket={socket} searchResults={searchResults} />
                  )}
                </div>
              </div>
            </div>
            {selectedChat ? (
              <ChatContainer socket={socket} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            ) : (
              <div className="welcome">
                <UserAvatar
                  username={user.username}
                  profilePic={user.profilePic}
                  avatarColor={user.avatarColor}
                  isLarge={true}
                />
                <h1>
                  Welcome, <span>{user.username}!</span>
                </h1>
                <h3>Select a chat to start messaging.</h3>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}

export default Chat;
