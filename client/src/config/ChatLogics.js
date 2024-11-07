export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isAnotherSender = (message, userId) => {
  return message.sender._id !== userId
};

export const isGroupRecieved = (message, chat, userId) => {
  return message.sender._id !== userId &&
    chat.isGroupChat;
};

export const getSender = (user, users) => {
  if (!users || users.length === 0) return "Unknown User"; // Handle empty users array
  return users.find((u) => u._id !== user._id)?.username || "Unknown User"; // Fallback for undefined
};

// In ChatLogics.js
export const getSenderProfilePic = (user, users) => {
  const sender = users.find((u) => u._id !== user._id); // Get the sender who is not the current user
  return sender ? sender.profilePic : 'defaultProfilePic.svg'; // Provide a default image if undefined
};


export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isLastMessage = (messages, message, i) => {
  return i === 0 || messages[i - 1].sender._id !== message.sender._id
};