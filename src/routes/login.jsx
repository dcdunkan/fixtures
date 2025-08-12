import LoginForm from "@/components/LoginForm";
import React from "react";
import "./login.css";
import { useAuth } from "@/components/AuthProvider";
import { HTTPError } from "ky";
import { redirect } from "react-router";

export default function Login() {
    const { api, setAccessToken, setData } = useAuth();

    async function handleLogin(email, password) {
        try {
            const result = await api.post("user/login", {
                json: {
                    email: email,
                    password: password,
                },
            }).json();
            setAccessToken(result.accessToken);
            setData(result.user);
            window.location.href = "/";
        } catch (error) {
            if (error instanceof HTTPError) {
                const response = await error.response.json();
                alert(response.message);
                return;
            }
            alert("Something went wrong");
        }
    }

    return (
        <div className="login-container">
            <LoginForm onLogin={handleLogin} />
        </div>
    );
}
