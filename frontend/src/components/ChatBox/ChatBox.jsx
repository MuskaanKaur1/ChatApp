import React, { useState, useEffect } from "react";
import "./ChatBox.css";
import { io } from "socket.io-client";
import sendButton from "../../assets/sendButton.jpg";
import galleryIcon from "../../assets/galleryIcon.png"; 
import defaultAvatar from "../../assets/avatar.jpg";
import greenDot from "../../assets/greenDot.jpg";
import axios from "axios";


const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

const ChatBox = ({ userId, receiverId, receiverName, receiverAvatar }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const senderId = localStorage.getItem("userId");
  


  
  //  Fetch messages when component mounts or receiver changes
  useEffect(() => {
    if (!senderId || !receiverId) return;
  
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/${senderId}/${receiverId}`
        );
  
        // Merge new messages while preventing duplicates
        setMessages((prevMessages) => {
          const seen = new Set(prevMessages.map((msg) => msg._id));
          const newMessages = response.data.filter((msg) => !seen.has(msg._id));
          return [...prevMessages, ...newMessages]; 
        });
      } catch (error) {
        console.error(" Error fetching messages:", error);
      }
    };
  
    fetchMessages();
  }, [senderId, receiverId]); 
   //  Keep only this
  


  useEffect(() => {
    const fetchMedia = async () => {
      if (!receiverId) {
        console.error(" receiverId is missing");
        return;
      }
  
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/media/${receiverId}`
        );
  
        if (response.status === 200) {
          console.log(" Media fetched:", response.data);
          setMedia(response.data);
        } else {
          console.error(" Media not found:", response.status);
          setMedia([]);
        }
      } catch (error) {
        console.error(" Error fetching media:", error.response?.data || error);
        setMedia([]); // Ensure UI doesn't break
      }
    };
  
    fetchMedia();
  }, [receiverId]);
  


  //  Listen for incoming messages and update state
  useEffect(() => {
    const handleReceiveMessage = async (data) => {
      console.log(" Message received:", data);
  
      if ((data.sender === receiverId && data.receiver === userId) || 
          (data.sender === userId && data.receiver === receiverId)) {
  
        setMessages((prevMessages) => {
          const seen = new Set(prevMessages.map((msg) => msg._id || msg.tempId));
          if (seen.has(data._id || data.tempId)) return prevMessages;
          
          return [...prevMessages, data];
        });
  
        //  Save new messages in MongoDB to persist them
        try {
          await axios.post("http://localhost:5000/api/messages", data);
        } catch (error) {
          console.error(" Error saving message:", error);
        }
      }
    };
  
    socket.on("receive_message", handleReceiveMessage);
  
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [receiverId, userId]);
  
  

  const sendMessage = async (imageFile = null) => {
    if (!message.trim() && !imageFile) return;
  
    const messageData = new FormData();
    messageData.append("sender", userId);
    messageData.append("receiver", receiverId);
    messageData.append("text", message);
    if (imageFile) messageData.append("image", imageFile);
  
    try {
      const response = await axios.post("http://localhost:5000/api/messages", messageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      //  Send to WebSocket (server will broadcast it)
      socket.emit("send_message", response.data);
  
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error(" Error sending message:", error);
    }
  };
  
  
  
  useEffect(() => {
    if (!userId || !receiverId) return;
  
    socket.emit("join_chat", userId);
  
    return () => {
      socket.off("join_chat");
    };
  }, [userId, receiverId]);
  

  // Functionality for gallery icon click
  const handleGalleryClick = () => {
    document.getElementById("fileInput").click();
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendMessage(file);
    }
  };
  

  return (
    <div className="chat-box">
      {/* Chat Header with selected user's avatar, name, online status*/}
      <div className="chat-header">
      <img src={receiverAvatar || defaultAvatar} alt="User Avatar" className="user-icon" />
      <span className="user-name">{receiverName}</span>
        
        {/* Green Dot for Online Status */}
        <img src={greenDot} alt="Online Status" className="online-status" />


      </div>

      <div className="chat-msg">
      {messages.map((msg, index) => (
        <div key={index} className={msg.sender === userId ? "sender-msg" : "receiver-msg"}>
          {msg.text && <p className="msg">{msg.text}</p>}
          
          {/*  Display image properly */}
          {msg.image && (
            <img 
              src={`http://localhost:5000/uploads/${msg.image}`} 
              alt="Sent image" 
              className="msg-img"
            />
          )}
        </div>
      ))}
    </div>


      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        {/* Hidden file input for image upload */}
        <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleImageUpload} />
        
        {/* Gallery icon beside send button */}
        <img src={galleryIcon} alt="Gallery" className="galleryIcon" onClick={handleGalleryClick} />
        <img src={sendButton} alt="Send" className="sendButton" onClick={sendMessage} />
      </div>

    </div>
  );
};

export default ChatBox;
