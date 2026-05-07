"use client";
import { useState } from "react";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  const login = () => {
    if (password === "fiore123") {
      setLoggedIn(true);
    } else {
      alert("Wrong password");
    }
  };

  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>
          <h2>Admin Login</h2>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              marginTop: "10px",
              color: "black"
            }}
          />

          <button
            onClick={login}
            style={{
              marginLeft: "10px",
              padding: "10px",
              background: "red",
              color: "white"
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "black",
      color: "white",
      padding: "20px"
    }}>
      <h1 style={{ color: "red" }}>Admin Dashboard</h1>

      <p>You are logged in.</p>
    </div>
  );
}