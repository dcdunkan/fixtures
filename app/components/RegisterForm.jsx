import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterForm.css";

export default function RegisterForm({ onRegister }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    function validate() {
        const errs = {};
        if (!name) errs.name = "Name is required.";
        if (!email) errs.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email is invalid.";
        if (!password) errs.password = "Password is required.";
        else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
        if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
        else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
        return errs;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            onRegister(email, password, name);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="registerform-box">
            <h2 className="registerform-title">Sign Up</h2>
            <div className="title-underline" />

            <div className="input-with-icon">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="register-input"
                />
            </div>
            {errors.name && <p className="error-text">{errors.name}</p>}

            <div className="input-with-icon">
                <input
                    type="email"
                    placeholder="Email id"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="register-input"
                />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}

            <div className="input-with-icon">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="register-input"
                />
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}

            <div className="input-with-icon">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="register-input"
                />
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

            <div className="button-row">
                <button type="submit" className="register-btn-active">Sign up</button>
                <Link to="/login" className="register-btn">Sign in</Link>
            </div>
        </form>
    );
}
