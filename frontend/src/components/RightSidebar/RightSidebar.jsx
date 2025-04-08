import React, { useEffect, useState } from "react";
import "./RightSidebar.css";
import defaultAvatar from "../../assets/avatar.jpg"; 
import greenDot from "../../assets/greenDot.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const RightSidebar = ({ receiverId }) => {
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState([]);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Fetch receiver profile data
  useEffect(() => {
    if (!receiverId) return; // No receiver selected

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/profile/${receiverId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setUser(data); // Corrected
        setMedia(data.media || []); // Assuming `media` is an array in user profile
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [receiverId]);

  console.log("ReceiverId:", receiverId);



  // Fetch media shared between users
    useEffect(() => {
      const fetchMedia = async () => {
        if (!receiverId) {
          console.error("receiverId is missing");
          return;
        }
    
        try {
          const response = await axios.get(`http://localhost:5000/api/messages/media/${receiverId}`);
          console.log("Media fetched:", response.data);
          setMedia(response.data);
        } catch (error) {
          console.error("Error fetching media:", error.response?.data || error.message);
        }
      };
    
      fetchMedia();
    }, [receiverId]); // Runs only when receiverId changes
    

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove auth token (if stored)
    window.location.href = "/login"; // Redirect to login page
  };


  // Function to navigate to profile page
  const handleProfileClick = () => {
    
  };

  // Fetch logged-in user profile (for updates)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/profile/${userId}?t=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        setUser(data); // Update user state
      } catch (error) {
        console.error(" Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  console.log("User Data in RightSidebar:", user);


  return (
    <div className="rightside">
      {/* Profile Info */}
      <div className="rightside-profile">
        
      <img 
        src={user?.avatar 
          ? user.avatar.startsWith("http") 
            ? user.avatar 
            : `http://localhost:5000/uploads/${user.avatar}`
          : defaultAvatar} 
        alt="Profile" 
        onClick={handleProfileClick} 
        style={{ cursor: "pointer" }} 
      />

      
      <h3>
        {user ? user.name : "Select a user"}
        {user && <img src={greenDot} alt="Online" className="green" />}
      </h3>
      <p>{user?.bio || "No bio available"}</p>
      </div>

      <hr />


         {/* Media Section */}
      <div className="rightside-media">
        <p></p>
        <div>
          {media.length > 0 ? (
            media.map((img, index) => <img key={index} src={img} alt="Media" />)
          ) : (
            <p></p>
          )}
        </div>
      </div>

{/* Logout Button */}
<button onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }}>Logout</button>
    </div>
  );
};

export default RightSidebar;
