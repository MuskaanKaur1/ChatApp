import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../src/pages/Login/Login";
import Chat from "../src/pages/Chat/Chat";
import ProfileUpdate from "../src/pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect "/" to "/login" */}
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
};

export default App;
