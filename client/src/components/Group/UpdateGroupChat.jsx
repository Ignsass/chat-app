import { useState, useEffect } from "react";
import { GrFormClose } from "react-icons/gr";
import { BsPencil, BsPencilFill } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

import { ChatState } from "../../context/ChatProvider";
import {
    allUsersRoute,
    updateGroupPicChatRoute,
    renameGroupChatRoute,
    addGroupChatRoute,
    removeGroupChatRoute
} from "../../utils/APIRoutes";
import { toastOptions } from "../../utils/constants";
import UserListItem from "../Au/UserListItem";
import UserBage from "../Au/UserBage";

const UpdateGroupChat = ({ fetchAgain, setFetchAgain, setModalActive }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSearch, setActiveSearch] = useState(false);
    const [showChatNameInput, setShowChatNameInput] = useState(false);

    const { selectedChat, setSelectedChat, user } = ChatState();

    const imageUpload = async (event) => {
        event.preventDefault();
        const groupPic = event.target.files[0];
        const formData = new FormData();
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
        try {
            formData.append("chatId", selectedChat._id);
            if (groupPic) formData.append("groupPic", groupPic, groupPic.name);
            const { data } = await axios.put(updateGroupPicChatRoute, formData, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update group picture", toastOptions);
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setActiveSearch(false);
            return;
        }
        try {
            setActiveSearch(true);
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${allUsersRoute}?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            setLoading(false);
            toast.error("Failed to load the Search Results", toastOptions);
        }
    };

    const handleRename = async () => {
        setShowChatNameInput(false);
        if (!groupChatName) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(renameGroupChatRoute, { chatId: selectedChat._id, chatName: groupChatName }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            toast.success("Group name updated successfully", toastOptions);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to rename group chat", toastOptions);
        }
        setGroupChatName("");
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast.error("User already in group!", toastOptions);
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast.error("Only admins can add new users", toastOptions);
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(addGroupChatRoute, {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            toast.success("User added to the group successfully", toastOptions);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add user", toastOptions);
        }
        setLoading(false);
    };

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast.error("Only admins can remove users from group chat", toastOptions);
            return;
        }
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(removeGroupChatRoute, { chatId: selectedChat._id, userId: user1._id }, config);
            user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove user", toastOptions);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="update-group modal-wrapper">
                <div className={`modal-container ${activeSearch ? 'active-search' : ''}`}>
                    <div className='close-button-wrapper'>
                        <button className='close-button' onClick={() => { setModalActive('not') }}>
                            <GrFormClose />
                        </button>
                    </div>
                    <div className='modal-header'>
                        <div className="avatar">
                            <label>
                                <input
                                    type="file"
                                    name="groupPic"
                                    accept="image/*"
                                    onChange={imageUpload}
                                />
                                <img src={selectedChat.groupPic} alt={selectedChat.chatName} />
                                <div className="hover-text">Update chat picture</div>
                            </label>
                        </div>
                        <div className="center">
                            {showChatNameInput ? (
                                <div className='modal-input'>
                                    <input
                                        placeholder={selectedChat.chatName}
                                        value={groupChatName}
                                        onChange={(e) => setGroupChatName(e.target.value)}
                                    />
                                    <BsPencil />
                                    <button className="button-submit" onClick={handleRename}>Save</button>
                                </div>
                            ) : (
                                <>
                                    <h2>{selectedChat.chatName}</h2>
                                    <BsPencilFill onClick={() => { setShowChatNameInput(true) }} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="modal-content">
                        <div className='selected-users-wrapper'>
                            {selectedChat.users.map((u) => (
                                <UserBage
                                    key={u._id}
                                    user={u}
                                    admin={selectedChat.groupAdmin}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </div>
                        <div className="inputs">
                            <div className='modal-input'>
                                <input
                                    placeholder="Add new user"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <AiOutlineUserAdd />
                            </div>
                        </div>

                        <div className="width-100 search-users">
                            {loading || !activeSearch || search === "" ? (
                                <></>
                            ) : (
                                searchResult?.slice(0, 2).map((result) => (
                                    <UserListItem
                                        key={result._id}
                                        result={result}
                                        handleFunction={() => handleAddUser(result)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default UpdateGroupChat;
