import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

import { AuthLayout } from "./routes/AuthLayout";
import Home from "./routes/home";
import Login from "./routes/login";
import Register from "./routes/register";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AuthLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
        </Route>,
    ),
);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <RouterProvider router={router} />
    </ThemeProvider>,
);
