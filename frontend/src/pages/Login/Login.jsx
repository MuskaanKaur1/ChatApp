import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import Logo from "../../assets/Logo.png";

const Login = () => {
  const [currState, setCurrState] = useState("Login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = currState === "Sign Up" ? "/api/auth/register" : "/api/auth/login";
    const { name, email, password } = formData;

     // Validation
  if (!email || !password || (currState === "Sign Up" && !name)) {
    setMessage("Please fill in all required fields.");
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    setMessage("Password must be at least 6 characters long.");
    setLoading(false);
    return;
  }

    try {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currState === "Sign Up" ? { name, email, password } : { email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `${currState} failed`);

      setMessage(`${currState} Successful!`);

      if (currState === "Login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        navigate("/chat");
      } else {
        setCurrState("Login");
      }

      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>
          <img src={Logo} alt="Logo" className="logo" /> {currState}
        </h2>

        {message && <p className="message">{message}</p>}

        {currState === "Sign Up" && (
          <input
            name="name"
            onChange={handleChange}
            value={formData.name}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}

        <input
          name="email"
          onChange={handleChange}
          value={formData.email}
          type="email"
          placeholder="Email address"
          className="form-input"
          required
        />

        <input
          name="password"
          onChange={handleChange}
          value={formData.password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="login-term">
          <input type="checkbox" className="checkbox" />
          <p>I Agree to all the terms and conditions.</p>
        </div>

        <div className="login-forget">
          <p className="login-toggle">
            {currState === "Sign Up" ? "Already have an account?" : "Create an account?"}{" "}
            <span onClick={() => setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")}>
              {currState === "Sign Up" ? "Login here" : "Click here"}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
