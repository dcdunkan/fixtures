import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email is invalid.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onLogin(email, password);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="loginform-box">
      <h2 className="loginform-title">Sign In</h2>
      <div className="title-underline" />

      <div className="input-with-icon">
        
        <input
          type="email"
          placeholder="Email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
      </div>
      {errors.email && <p className="error-text">{errors.email}</p>}

      <div className="input-with-icon">
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
      </div>
      {errors.password && <p className="error-text">{errors.password}</p>}

      

      <div className="button-row">
        <button type="submit" className="login-btn-active">
          Sign in
        </button>
        <Link to="/register" className="login-btn">
          Sign up
        </Link>
      </div>
    </form>
  );
}
