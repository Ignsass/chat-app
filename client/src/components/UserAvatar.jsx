import React from "react";

const UserAvatar = ({ username, profilePic, avatarColor, isLarge }) => {
    const initial = username ? username.charAt(0).toUpperCase() : "U";
    const bgColor = avatarColor || "#ccc";

    // Define adjustable sizes here
    const defaultSize = "60px";  // Default avatar size
    const largeSize = "250px";   // Larger avatar size for welcome or specific sections
    const avatarSize = isLarge ? largeSize : defaultSize;
    const fontSize = isLarge ? "5rem" : "1.8rem";

    return profilePic && profilePic !== "default.svg" ? (
        <img 
            src={profilePic} 
            alt={username} 
            className="icon-button profile-pic" 
            style={{ width: avatarSize, height: avatarSize, borderRadius: "50%" }}
        />
    ) : (
        <div
            className="icon-button profile-placeholder"
            style={{
                backgroundColor: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                width: avatarSize,
                height: avatarSize,
                color: "#fff",
                fontSize: fontSize,
                fontWeight: "bold",
            }}
        >
            {initial}
        </div>
    );
};

export default UserAvatar;
