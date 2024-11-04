import { useState, useEffect, useRef } from "react";
import { GrFormClose } from "react-icons/gr";
import { BsPencil } from "react-icons/bs";
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { FiMail, FiLock, FiUnlock } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import {
    renameUserRoute,
    emailUpdateRoute,
    profilePicUpdateRoute,
    passwordUpdateRoute,
} from "../utils/APIRoutes";
import { toastOptions } from "../utils/constants";
import { io } from "socket.io-client";
import { host } from "../utils/APIRoutes";

function UpdateProfile({ fetchAgain, setFetchAgain, setModalActive, handleDelete }) {
    const { user, setUser } = ChatState();
    const socket = useRef(null);
    const modalRef = useRef(null);

    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const [showOld, setShowOld] = useState(false);
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        socket.current = io(host); // Sukurkite socket ryšį
        socket.current.emit("setup", user); // Sukonfigūruokite vartotojo informaciją
        return () => {
            if (socket.current) socket.current.disconnect(); // Atjunkite ryšį, kai komponentas yra sunaikinamas
        };
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalActive("not");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setModalActive]);

    const handleLocalStorage = (data) => {
        if (data.status === true) {
            localStorage.setItem(
                process.env.REACT_APP_LOCALHOST_KEY || "userInfo",
                JSON.stringify(data.updatedUser)
            );
        }
    };

    const handleRename = async () => {
        if (!newUsername) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(renameUserRoute, { userId: user._id, newUsername }, config);
            if (!data.status) {
                throw new Error(data.msg);
            }
            setUser({ ...data.updatedUser, avatarColor: user.avatarColor });
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);

            socket.current.emit("usernameUpdated", { userId: user._id, username: newUsername });

            toast.success("Your username was changed successfully", toastOptions);
        } catch (error) {
            toast.error(error.message || "Failed to update username", toastOptions);
        }
        setNewUsername("");
        setShowUsernameInput(false);
    };

    const handleEmail = async () => {
        if (!newEmail) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(emailUpdateRoute, { userId: user._id, newEmail }, config);
            if (!data.status) {
                throw new Error(data.msg);
            }
            setUser(data.updatedUser);
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);
            toast.success("Your email was changed successfully", toastOptions);
        } catch (error) {
            toast.error(error.message || "Failed to update email", toastOptions);
        }
        setNewEmail("");
        setShowEmailInput(false);
    };

    const imageUpload = async (event) => {
        const profilePic = event.target.files[0];
        const formData = new FormData();
        formData.append("userId", user._id);
        if (profilePic) formData.append("profilePic", profilePic, profilePic.name);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(profilePicUpdateRoute, formData, config);
            setUser(data.updatedUser);
            handleLocalStorage(data);
            setFetchAgain(!fetchAgain);
            toast.success("Profile picture updated successfully", toastOptions);
        } catch (error) {
            toast.error("Failed to update profile picture", toastOptions);
        }
    };

    const handlePassword = async () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_+])[A-Za-z\d!@#$%^&*_+]{5,20}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error(
                "Password must be 5-20 characters long, include uppercase, lowercase, a number, and a special character",
                toastOptions
            );
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            toast.error("Passwords do not match.", toastOptions);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(passwordUpdateRoute, { userId: user._id, oldPassword, newPassword }, config);
            toast.success("Your password was changed successfully", toastOptions);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password", toastOptions);
        }
        setOldPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setShowPasswordInput(false);
    };

    return (
        <>
            <div className="modal-wrapper user-update">
                <div ref={modalRef} className={`modal-container ${showPasswordInput ? "smaller" : ""}`}>
                    <div className="close-button-wrapper">
                        <button className="close-button" onClick={() => setModalActive("not")}>
                            <GrFormClose />
                        </button>
                    </div>
                    <div className="modal-header">
                        <div className="avatar">
                            <label>
                                <input type="file" name="profilePic" accept="image/*" onChange={imageUpload} />
                                {user.profilePic && user.profilePic !== "default.svg" ? (
                                    <img src={user.profilePic} alt={user.username} className="profile-pic" />
                                ) : (
                                    <div
                                        className="profile-initial"
                                        style={{
                                            backgroundColor: user.avatarColor || "#007bff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "50%",
                                            width: "40px",
                                            height: "40px",
                                            color: "#fff",
                                            fontSize: "1.2rem",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                                    </div>
                                )}
                                <div className="hover-text">Update profile picture</div>
                            </label>
                        </div>
                    </div>
                    <div className="modal-content">
                        <div className="inputs">
                            {showUsernameInput ? (
                                <div className="modal-input">
                                    <input type="text" placeholder={user.username} value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                    <BsPencil />
                                    <button className="button-submit" onClick={handleRename}>Save</button>
                                </div>
                            ) : (
                                <div className="modal-input not-show">
                                    <span>Username: </span>
                                    <span>{user.username}</span>
                                    <button className="button-submit" onClick={() => setShowUsernameInput(true)}>Update</button>
                                </div>
                            )}
                            {showEmailInput ? (
                                <div className="modal-input">
                                    <input type="email" placeholder={user.email} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                    <FiMail />
                                    <button className="button-submit" onClick={handleEmail}>Save</button>
                                </div>
                            ) : (
                                <div className="modal-input not-show">
                                    <span>Email: </span>
                                    <span>{user.email}</span>
                                    <button className="button-submit" onClick={() => setShowEmailInput(true)}>Update</button>
                                </div>
                            )}
                            {showPasswordInput ? (
                                <>
                                    <div className="modal-input">
                                        <input type={showOld ? "text" : "password"} placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                        <FiUnlock />
                                        <RxEyeOpen className={showOld ? "password-icon" : "none"} onClick={() => setShowOld(false)} />
                                        <RxEyeClosed className={!showOld ? "password-icon" : "none"} onClick={() => setShowOld(true)} />
                                    </div>
                                    <div className="modal-input">
                                        <input type={show ? "text" : "password"} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        <FiUnlock />
                                        <RxEyeOpen className={show ? "password-icon" : "none"} onClick={() => setShow(false)} />
                                        <RxEyeClosed className={!show ? "password-icon" : "none"} onClick={() => setShow(true)} />
                                    </div>
                                    <div className="modal-input">
                                        <input type={showConfirm ? "text" : "password"} placeholder="Confirm new password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
                                        <FiLock />
                                        <RxEyeOpen className={showConfirm ? "password-icon" : "none"} onClick={() => setShowConfirm(false)} />
                                        <RxEyeClosed className={!showConfirm ? "password-icon" : "none"} onClick={() => setShowConfirm(true)} />
                                        <button className="button-submit" onClick={handlePassword}>Save</button>
                                    </div>
                                </>
                            ) : (
                                <div className="modal-input not-show">
                                    <span>Password: </span>
                                    <span>********</span>
                                    <button className="button-submit" onClick={() => setShowPasswordInput(true)}>Update</button>
                                </div>
                            )}
                        </div>
                        <div className="delete">
                            <span onClick={handleDelete}>Delete account...</span>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default UpdateProfile;
