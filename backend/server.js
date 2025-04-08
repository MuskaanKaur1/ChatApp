const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const messageRoutes = require("./routes/messages");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes"); //  Added User Routes
const Message = require("./models/Message");
const express = require("express");
const app = express();
const User = require("./models/User"); 
const server = http.createServer(app);
const path = require("path"); //  Import path module



app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5137"], //  Allow frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"], //  Add PUT and DELETE
  allowedHeaders: ["Content-Type", "Authorization"], //  Allow necessary headers
  credentials: true, //  Allow cookies if needed
}));



app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); //  Register User Routes

app.use("/uploads", express.static("uploads"));


app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: " senderId or receiverId is missing" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId } // Fetch messages both ways
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: " Server error fetching messages" });
  }
});

app.get("/api/messages/media/:receiverId", async (req, res) => {
  const { receiverId } = req.params;

  if (!receiverId) {
    return res.status(400).json({ error: " receiverId is missing" });
  }

  try {
    const mediaMessages = await Message.find({
      receiver: receiverId,
      image: { $ne: null }, //  Fetch only messages that contain images
    }).sort({ createdAt: -1 });

    if (!mediaMessages.length) {
      return res.status(404).json({ error: " No media found for this user" });
    }

    res.json(mediaMessages.map(msg => msg.image)); // ✅ Return array of image URLs
  } catch (err) {
    console.error(" Error fetching media:", err);
    res.status(500).json({ error: " Server error fetching media" });
  }
});



const io = require("socket.io")(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,  //  Wait up to 5 seconds before failing
})
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));


const users = {}; // Store active users' socket IDs

io.on("connection", (socket) => {
  console.log(` User connected: ${socket.id}`);

  socket.on("join_chat", (userId) => {
    users[userId] = socket.id; //  Store user socket ID
    socket.join(userId);
    console.log(` User ${userId} joined chat. Users list:`, users);
  });

  socket.on("send_message", async (data) => {
    console.log(" Received message:", data);

    const { sender, receiver, text, image } = data;
    if (!sender || !receiver) {
      console.error(" Missing sender or receiver:", { sender, receiver });
      return;
    }

    try {
      const newMessage = new Message({
        sender,
        receiver,
        text: text || null,
        image: image || null,
      });

      await newMessage.save();
      console.log(" Message saved to MongoDB:", newMessage);

      const receiverSocket = users[receiver]; //  Get receiver socket
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", newMessage); //  Send to receiver
        console.log(` Message sent to receiver (${receiver}) at socket ${receiverSocket}`);
      } else {
        console.log(` Receiver (${receiver}) is offline.`);
      }

      io.to(socket.id).emit("receive_message", newMessage); //  Also update sender's chat UI
    } catch (err) {
      console.error(" Message saving failed:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId]; //  Remove user from active list
        break;
      }
    }
    console.log("Updated users list:", users);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
