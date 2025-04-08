import React, { useEffect, useState } from "react";
import "./LeftSidebar.css";
import defaultAvatar from "../../assets/avatar.jpg";
import Logo from "../../assets/Logo.png";
import menu from "../../assets/menu.png";
import searchIcon from "../../assets/searchIcon.png";

const LeftSidebar = ({ setReceiver, handleLogout, loggedInUser }) => {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
      const fetchFriends = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/users");
          if (!response.ok) throw new Error("Failed to fetch users");
    
          const data = await response.json();
          setFriends(data);
        } catch (error) {
          console.error(" Error fetching users:", error);
        }
      };

      const fetchOnlineUsers = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/users/online-users");
          if (!response.ok) throw new Error("Failed to fetch online users");
    
          const data = await response.json();
          console.log(" Online Users:", data);
          setOnlineUsers(data);
        } catch (error) {
          console.error(" Error fetching online users:", error);
        }
      };
    
      fetchFriends();

    if (loggedInUser) {
      fetchOnlineUsers();
      const interval = setInterval(fetchOnlineUsers, 5000);
      return () => clearInterval(interval);
    }
  }, [loggedInUser]); 


  const filteredFriends = friends?.filter((friend) =>
    friend.name ? friend.name.toLowerCase().includes(search.toLowerCase()) : false
  );
  

  const selectUser = (friend) => {
    if (!friend?._id) return;
    setReceiver({
      id: friend._id,
      name: friend.name,
      avatar: friend.avatar || defaultAvatar,
    });
  };
  
  

  return (
    <div className="leftside">
      {/* Top Navigation */}
      <div className="leftside-top">
        <div className="leftside-nav">
          <img src={Logo} alt="ChatApp Logo" className="logo" />
          <p>ChatApp</p>
          <div className="menu">
            <img src={menu} alt="Menu" />
            
          </div>
        </div>

        {/* Search Bar */}
        <div className="leftside-search">
          <img src={searchIcon} alt="Search" className="searchIcon" />
          <input
            type="text"
            placeholder="Search here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Friends List */}

      <div className="leftside-list">
        {filteredFriends?.length > 0 ? (
          filteredFriends.map((friend) => {
            const isOnline = onlineUsers.some(user => user._id === friend._id);
      
            return (
              <div key={friend._id} className="friends" onClick={() => selectUser(friend)}>
                <img src={friend.avatar || defaultAvatar} alt="Profile" />
                <div>
                  <p>{friend.name} {isOnline && <span className="online-badge">● Online</span>}</p>
                  <span>Click to chat</span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No users found.</p>
        )}
      </div>

    </div>
  );
};

export default LeftSidebar;
