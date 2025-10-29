import "./index.css";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "./components/ui/sonner";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import ClubsPage from "./routes/clubs";
import ClubPage from "./routes/clubs/[clubId]";
import HomePage from "./routes/home";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import SettingsPage from "./routes/settings";
import TournamentsPage from "./routes/tournaments";
import TournamentPage from "./routes/tournaments/[tournamentId]";
import StagePage from "./routes/tournaments/[tournamentId]/stages/[stageId]";
import SchedulePage from "./routes/tournaments/[tournamentId]/stages/[stageId]/schedule";

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
                path: "tournaments",
                children: [
                    {
                        index: true,
                        Component: TournamentsPage,
                    },
                    {
                        path: ":tournamentId",
                        children: [
                            {
                                index: true,
                                Component: TournamentPage,
                            },
                            {
                                path: "stages",
                                children: [
                                    {
                                        path: ":stageId",
                                        children: [
                                            { index: true, Component: StagePage },
                                            {
                                                path: "schedule",
                                                // children: [
                                                //     {
                                                //         path: ":stageItemId",
                                                Component: SchedulePage,
                                                //     },
                                                // ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                path: "settings",
                Component: SettingsPage,
            },
        ],
    },
], { basename: import.meta.env.VITE_BASE_PATH || "" });

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <ThemeProvider attribute="class">
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster toastOptions={{ className: "font-sans" }} />
        </AuthProvider>
    </ThemeProvider>,
);
