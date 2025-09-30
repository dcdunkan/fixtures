import "./index.css";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "./components/ui/sonner";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import Clubs from "@/routes/clubs";
import ClubHome from "@/routes/clubs/[clubId]";
import Home from "@/routes/home";
import Login from "@/routes/login";
import Register from "@/routes/register";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/clubs/:clubId" element={<ClubHome />} />
            </Route>
        </Route>,
    ),
);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster toastOptions={{ className: "font-sans" }} />
        </AuthProvider>
    </ThemeProvider>,
);
