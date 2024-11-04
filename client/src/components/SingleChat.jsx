import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { ChatState } from "../context/ChatProvider";
import { recieveMessageRoute, sendMessageRoute, addReactionRoute } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import UserAvatar from "./UserAvatar";
import ChatInput from "./ChatInput";

function SingleChat({ fetchAgain, socket, setFetchAgain, selectedChat }) {
    const [messages, setMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [newAttach, setNewAttach] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reactionMenu, setReactionMenu] = useState(null);
    const scrollRef = useRef();
    const { user } = ChatState();

    const emojiOptions = ["❤️", "👍", "😊"];

    const uploadToServer = async (file) => {
        const formData = new FormData();
        formData.append("attachment", file);
        try {
            const response = await axios.post("http://localhost:5000/api/upload", formData);
            return response.data.url;
        } catch (error) {
            toast.error("Failed to upload image", toastOptions);
            return null;
        }
    };

    const sendMessage = async (msg) => {
        setLoading(true);
        try {
            let attachmentUrl = null;
            if (newAttach) {
                attachmentUrl = await uploadToServer(newAttach);
            }
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(sendMessageRoute, {
                sender: user._id,
                chatId: selectedChat._id,
                content: msg || '',
                attachment: attachmentUrl || "",
            }, config);

            socket.current.emit("new message", data);
            setMessages([...messages, data]);
            setNewAttach(null);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to send the message", toastOptions);
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${recieveMessageRoute}/${selectedChat._id}`, config);
            setMessages(data);
            socket.current.emit("join chat", selectedChat._id);
        } catch (error) {
            toast.error("Failed to load messages", toastOptions);
        }
    };

    const addReaction = async (messageId, emoji) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(addReactionRoute, { messageId, emoji }, config);
            // Maintain the current avatarColor by ensuring messages are only updated where necessary
            setMessages((prevMessages) =>
                prevMessages.map((m) => (m._id === messageId ? { ...m, reactions: data.message.reactions } : m))
            );
            setReactionMenu(null);

            socket.current.emit("reaction added", data.message);
        } catch (error) {
            toast.error("Failed to add reaction", toastOptions);
        }
    };

    const handleNewMessage = (newMessageReceived) => {
        setMessages([...messages, newMessageReceived]);
    };

    const handleReactionUpdate = (updatedMessage) => {
        setMessages((prevMessages) =>
            prevMessages.map((m) => (m._id === updatedMessage._id ? { ...m, reactions: updatedMessage.reactions } : m))
        );
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        if (socket.current) {
            socket.current.on("message received", handleNewMessage);
            socket.current.on("reaction received", handleReactionUpdate);
        }
    }, [messages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView();
    }, [messages]);

    return (
        <>
            <div className={`messages-container ${newAttach ? 'grid' : ''}`}>
                <div className="chat-messages">
                    {messages.map((message) => (
                        <div ref={scrollRef} key={uuidv4()}>
                            <div
                                className={`message ${message.sender._id === user._id ? "sended" : "recieved"}`}
                                onClick={() =>
                                    message.sender._id !== user._id &&
                                    setReactionMenu(reactionMenu === message._id ? null : message._id)
                                }
                            >
                                <UserAvatar
                                    username={message.sender.username}
                                    profilePic={message.sender.profilePic}
                                    avatarColor={message.sender.avatarColor}
                                />
                                <div className="content">
                                    <div>{message.content}</div>
                                    <span className="time">
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })}
                                    </span>
                                    {message.reactions && (
                                        <div className="reactions">
                                            {message.reactions.map((reaction, index) => (
                                                <span key={index}>{reaction.emoji}</span>
                                            ))}
                                        </div>
                                    )}
                                    {reactionMenu === message._id && (
                                        <div className="reaction-menu">
                                            {emojiOptions.map((emoji) => (
                                                <span
                                                    key={emoji}
                                                    onClick={() => addReaction(message._id, emoji)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <ChatInput handleSendMsg={sendMessage}setNewAttach={setNewAttach} newAttach={newAttach} />
            </div>
            <ToastContainer />
        </>
    );
}

export default SingleChat;
