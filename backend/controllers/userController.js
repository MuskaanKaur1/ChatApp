const User = require("../models/User");

//  Get Online Users
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true }).select("-password");
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get User Profile (Updated with Full Image URL)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure Full URL for Avatar Image
    const userProfile = {
      name: user.name,
      bio: user.bio,
      avatar: user.avatar ? `http://localhost:5000/uploads/${user.avatar}` : null, 
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Export Both Functions
module.exports = { getOnlineUsers, getUserProfile };
