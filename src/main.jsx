import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

import Home from "./routes/home";
import Login from "./routes/login";
import Register from "./routes/register";

const router = createBrowserRouter([
    {
        path: "/",
        Component: Home,
    },
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/register",
        Component: Register,
    },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <RouterProvider router={router} />
    </ThemeProvider>,
);
