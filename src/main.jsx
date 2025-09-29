import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Clubs from "@/routes/clubs";
import Home from "@/routes/home";
import Login from "@/routes/login";
import Register from "@/routes/register";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/clubs" element={<Clubs />} />
            </Route>
        </Route>,
    ),
);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <AuthProvider>
        <ThemeProvider attribute="class">
            <RouterProvider router={router} />
            <Toaster toastOptions={{ className: "font-sans" }} />
        </ThemeProvider>
    </AuthProvider>,
);
