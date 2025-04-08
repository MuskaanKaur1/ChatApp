import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";

import { io } from "socket.io-client"; //  Import WebSocket

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

const Chat = () => {
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); //  Fix: Prevent rendering before loading


  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName") || "Guest";
    const storedUserAvatar = localStorage.getItem("userAvatar") || "default-avatar.png";
  
    if (!storedUserId) {
      navigate("/login");
    } else {
      setCurrentUser({
        id: storedUserId,
        name: storedUserName,
        avatar: storedUserAvatar,
      });
    }
  
    setLoading(false); //  Ensure `loading` is always updated
  }, [navigate]);
  

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      if (currentUser) {
        socket.emit("user_status_changed", { userId: currentUser.id, isOnline: false });
      }
      localStorage.clear();
      navigate("/login");
    }
  };
  

  if (loading) {
    return <p>Loading chat...</p>; //  Fix: Prevents UI crashes when `currentUser` is null
  }


  return (
    <div className="chatPage">
      <div className="chat-container">
        {currentUser && (
          <LeftSidebar 
            setReceiver={setReceiver} //  Fix: Store full receiver info
            handleLogout={logout} 
            loggedInUser={currentUser} 
          />
        )}
        
        {receiver?.id ? (
          <ChatBox 
            userId={currentUser.id} 
            receiverId={receiver.id} 
            receiverName={receiver.name} 
            receiverAvatar={receiver.avatar} 
          />
        ) : (
          <p className="no-chat-selected">Please select a conversation</p>
        )}

        {receiver?.id && <RightSidebar receiverId={receiver.id} />}


      </div>
    </div>
  );
};


export default Chat;
