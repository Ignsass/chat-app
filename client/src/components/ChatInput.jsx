import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { GrFormClose } from "react-icons/gr";
import { MdOutlineAddAPhoto } from "react-icons/md";

function ChatInput({ handleSendMsg, setNewAttach, newAttach }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputElement = useRef();
  const emojiPickerRef = useRef(); // Reference for the emoji picker
  let url;

  useEffect(() => {
    inputElement.current.focus();
  }, []);

  // Close emoji picker if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  if (newAttach) {
    url = URL.createObjectURL(newAttach);
  }

  const handleEmojiClick = (event, emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setMsg((prevMsg) => prevMsg + emojiObject.emoji);
    }
  };

  const sendChat = (event) => {
    event.preventDefault();
    if ((msg && msg.trim().length > 0) || newAttach) {
      handleSendMsg(msg);
      setMsg("");
      setNewAttach(null);
    }
  };

  return (
    <div className="chat-input">
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <div className="button-container">
          <div className="emoji">
            <BsEmojiSmile onClick={handleEmojiPickerhideShow} />
            {showEmojiPicker && (
              <div ref={emojiPickerRef}> {/* Assign ref to emoji picker */}
                <Picker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>
        <input
          ref={inputElement}
          type="text"
          placeholder="Write a message..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <div className="buttons">
          <div className="hidden-input">
            <label className="icon-button">
              <input
                ref={inputElement}
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={(event) => setNewAttach(event.target.files[0])}
              />
              <MdOutlineAddAPhoto />
            </label>
          </div>
          <button type="submit" className="icon-button submit-button">
            <IoSend />
          </button>
        </div>
      </form>

      {newAttach && (
        <div className="attachment">
          <img src={url} className="attach-file" alt={newAttach.name} />
          <div className="close-button-wrapper">
            <button className="close-button" onClick={() => setNewAttach(null)}>
              <GrFormClose />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInput;
