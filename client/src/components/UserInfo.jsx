import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import { RxPencil2 } from "react-icons/rx";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import { deleteUserRoute, renameUserRoute } from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import UpdateProfile from "./UpdateProfile";
import SubmitModal from "./Au/SubmitModal";
import UserAvatar from "./UserAvatar";

const UserInfo = ({ fetchAgain, setFetchAgain }) => {
    const { user, setUser } = ChatState();
    const navigate = useNavigate();
    const [modalUpdateActive, setModalUpdateActive] = useState("not");
    const [deleteActive, setDeleteActive] = useState("not");
    const [warnText, setWarnText] = useState("");
    const [submText, setSubmText] = useState("");
    const [username, setUsername] = useState(user.username);
    const [avatarColor, setAvatarColor] = useState(user.avatarColor || "#007bff");

    useEffect(() => {
        setUsername(user.username);
        setAvatarColor(user.avatarColor || "#007bff"); // Ensure default color is set
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/auth");
    };

    const deleteAccount = () => {
        setModalUpdateActive("not");
        setDeleteActive("yes");
        setWarnText("You cannot restore your account. All your chats and messages will be permanently deleted.");
        setSubmText("Are you sure you want to delete your account?");
    };

    const handleDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(deleteUserRoute, { userId: user._id }, config);
            if (data.status === true) {
                setFetchAgain(!fetchAgain);
                toast.success("Your account was successfully deleted", toastOptions);
                localStorage.clear();
                navigate("/login");
            } else {
                toast.error("Failed to delete account. Try again later.", toastOptions);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account", toastOptions);
        }
    };

    const handleRename = async (newUsername) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(renameUserRoute, { userId: user._id, newUsername }, config);
            if (data.status === true) {
                setUser({ ...user, username: newUsername });
                setFetchAgain(!fetchAgain);
                toast.success("Your username was changed successfully", toastOptions);
            } else {
                toast.error("Failed to update username. Try again later.", toastOptions);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update username", toastOptions);
        }
    };

    return (
        <div className="user-info">
            <div className="user-data tooltip">
                <UserAvatar 
                    username={username} 
                    profilePic={user.profilePic} 
                    avatarColor={avatarColor} // Persist avatarColor directly
                />
                <span className="tooltiptext">{username}</span>
            </div>
            <div className="user-info buttons">
                <div className="tooltip">
                    <button className="icon-button" onClick={() => setModalUpdateActive("active")}>
                        <RxPencil2 />
                    </button>
                    <span className="tooltiptext">Update info</span>
                </div>
                <div className="tooltip">
                    <button className="icon-button" onClick={handleLogout}>
                        <BiPowerOff />
                    </button>
                    <span className="tooltiptext">Logout</span>
                </div>
            </div>
            {modalUpdateActive === "active" && (
                <UpdateProfile
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    setModalActive={setModalUpdateActive}
                    handleDelete={deleteAccount}
                    handleRename={handleRename} // Pass handleRename for username updates
                />
            )}
            {deleteActive === "yes" && (
                <SubmitModal
                    setModalActive={setDeleteActive}
                    warnText={warnText}
                    submText={submText}
                    handleFunction={handleDelete}
                />
            )}
            <ToastContainer />
        </div>
    );
};

export default UserInfo;
