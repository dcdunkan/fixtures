import { useAuth } from "@/hooks/auth";
import RegisterForm from "./RegisterForm";
import "./register.css";

export default function RegisterPage() {
    const { api } = useAuth();

    const basePath = import.meta.env.VITE_BASE_PATH || "";

    async function handleRegister({ email, password, name, handle }) {
        try {
            await api.post("user/register", {
                json: {
                    name: name,
                    email: email,
                    password: password,
                    handle: handle,
                },
            }).json();
            window.location.href = `${basePath}/login`;
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
            <title>Register &middot; Fixtures</title>

            <RegisterForm onRegister={handleRegister} />
        </div>
    );
}
