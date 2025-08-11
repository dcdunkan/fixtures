import LoginForm from "@/components/LoginForm";
import React from "react";
import "./login.css";

export default function Login() {
    function handleLogin(email, password) {
        alert(`Logging in: ${email}`);
    }

    return (
        <div className="login-container">
            <LoginForm onLogin={handleLogin} />
        </div>
    );
}
