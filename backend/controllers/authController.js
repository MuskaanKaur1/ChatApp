const User = require("../models/User"); // Ensure User model is imported

const loginUser = async (req, res) => {
  try {
    console.log(" Login Request Received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.error(" Missing Email or Password:", req.body);
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      console.error(" User Not Found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    console.log(" User Found in Database:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(" Invalid Password for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //  Check if the user has a valid `name`
    if (!user.name) {
      console.error(" User is missing a name:", user);
      return res.status(400).json({ message: "Your account is missing a name. Please contact support." });
    }

    //  Update `isOnline` without removing other fields
    await User.updateOne({ _id: user._id }, { $set: { isOnline: true } });

    console.log(" User logged in successfully:", user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error(" Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};



  
const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Set user as offline
    user.isOnline = false;
    await user.save();

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  

//  Ensure both functions are exported
module.exports = { loginUser, logoutUser };
