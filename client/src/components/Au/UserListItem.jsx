// UserListItem.jsx
import React from "react";
import UserAvatar from "../UserAvatar"; // Import UserAvatar component

const UserListItem = ({ handleFunction, result }) => {
  return (
    <div className="contact" onClick={handleFunction}>
      <UserAvatar 
        username={result.username} 
        profilePic={result.profilePic} 
        avatarColor={result.avatarColor} 
      />
      <h4>{result.username}</h4>
    </div>
  );
};

export default UserListItem;
