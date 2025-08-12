import RegisterForm from "@/components/RegisterForm";
import React from "react";
import "./register.css";
import { useAuth } from "@/components/AuthProvider";

export default function Register() {
    const { api } = useAuth();

    async function handleRegister(email, password, name) {
        try {
            const response = await api.post("user/register", {
                json: {
                    email: email,
                    username: name,
                    password: password,
                },
            }).json();
            window.location.href = "/login";
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
        <div className="register-container">
            <RegisterForm onRegister={handleRegister} />
        </div>
    );
}
