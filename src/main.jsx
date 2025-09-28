import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Home from "@/routes/home";
import Login from "@/routes/login";
import Register from "@/routes/register";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AuthLayout />}>
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route element={<DashboardLayout />}>
                <Route path="/" element={<Home />} />
            </Route>
        </Route>,
    ),
);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <RouterProvider router={router} />
        <Toaster toastOptions={{ className: "font-sans" }} />
    </ThemeProvider>,
);
