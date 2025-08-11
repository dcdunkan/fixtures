import React from "react";
import RegisterForm from "@/components/RegisterForm";
import "./Register.css";

export default function Register() {
  function handleRegister(email, password, name) {
    
    alert(`Registered: ${email}`);
  }

  return (
    <div className="register-container">
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}
