import { useAuth } from "@/hooks/auth";
import { ACCESS_TOKEN_LOCAL_STORAGE } from "@/lib/constants";
import { HTTPError } from "ky";
import LoginForm from "./LoginForm";
import "./login.css";

export default function LoginPage() {
    const { api } = useAuth();

    async function handleLogin(email, password) {
        try {
            const result = await api.post("user/login", {
                json: {
                    email: email,
                    password: password,
                },
            }).json();

            window.localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE, result.accessToken);
            window.location.href = "/";
        } catch (error) {
            if (error instanceof HTTPError) {
                const response = await error.response.json();
                alert(response.message);
                console.log(response);
                return;
            }
            alert("Something went wrong");
        }
    }

    return (
        <div className="login-container">
            <title>Login &middot; Fixtures</title>

            <LoginForm onLogin={handleLogin} />
        </div>
    );
}
