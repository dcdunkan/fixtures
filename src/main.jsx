import "./index.css";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "./components/ui/sonner";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import ClubsPage from "./routes/clubs";
import ClubPage from "./routes/clubs/[clubId]";
import SettingsPage from "./routes/clubs/settings";
import HomePage from "./routes/home";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";

const router = createBrowserRouter([
    {
        path: "/login",
        Component: LoginPage,
    },
    {
        path: "/register",
        Component: RegisterPage,
    },
    {
        path: "/",
        Component: DashboardLayout,
        children: [
            {
                index: true,
                Component: HomePage,
            },
            {
                path: "clubs",
                children: [
                    {
                        index: true,
                        Component: ClubsPage,
                    },
                    {
                        path: ":clubId",
                        Component: ClubPage,
                        loader: async function(p) {
                            // todo: make use of loaders
                        },
                    },
                ],
            },
            {
                path: "settings",
                Component: SettingsPage,
            },
        ],
    },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster toastOptions={{ className: "font-sans" }} />
        </AuthProvider>
    </ThemeProvider>,
);
