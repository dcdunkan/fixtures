import { AuthProvider } from "@/components/AuthProvider";
import { Outlet } from "react-router";

export function AuthLayout() {
    //   const { user } = useLoaderData(); // optionally fetch /api/me here
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
