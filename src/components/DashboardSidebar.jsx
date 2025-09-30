import { Home, Settings } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { ACCESS_TOKEN_LOCAL_STORAGE } from "@/lib/constants";
import { ChevronUpIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";
import { UserCircleIcon } from "lucide-react";
import { TrophyIcon } from "lucide-react";
import { Building2Icon } from "lucide-react";
import { LoaderCircleIcon } from "lucide-react";
import { CircleXIcon } from "lucide-react";
import { UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useLocation } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const SIDEBAR_NAVIGATION_ITEMS = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Clubs",
        url: "/clubs",
        icon: Building2Icon,
    },
    {
        title: "Teams",
        url: "/teams",
        icon: UsersIcon,
    },
    {
        title: "Tournaments",
        url: "/tournaments",
        icon: TrophyIcon,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    const { api, data } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [clubMemberships, setClubMemberships] = useState(
        /** @type {LoadedData<Tourney.MyClubMembership[]>} */ ({
            state: "pending",
            message: "Retrieving clubs",
        }),
    );

    useEffect(() => {
        /** @type {Promise<Tourney.MyClubMembership[]>}*/ (api.get("clubs").json())
            .then((clubMemberships) => {
                setClubMemberships({
                    state: "resolved",
                    data: clubMemberships,
                });
            })
            .catch((error) => {
                console.error(error);
                setClubMemberships({
                    state: "rejected",
                    message: "Unable to retrieve clubs",
                });
            });
    }, []);

    return (
        <Sidebar variant="slide">
            <SidebarHeader>
                <h1 className="font-bold text-center">Fixtures</h1>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SIDEBAR_NAVIGATION_ITEMS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                        className="cursor-default"
                                    >
                                        <span onClick={() => navigate(item.url)}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>My Clubs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {clubMemberships.state === "pending"
                            ? (
                                <div className="text-xs text-muted-foreground p-2 inline-flex gap-2">
                                    <LoaderCircleIcon className="animate-spin size-4" /> {clubMemberships.message}
                                </div>
                            )
                            : clubMemberships.state === "resolved"
                            ? clubMemberships.data.length === 0
                                ? (
                                    <div className="text-xs text-muted-foreground p-2 ">
                                        You are not part of a club.
                                    </div>
                                )
                                : (
                                    <SidebarMenu>
                                        {clubMemberships.data.map((membership) => {
                                            const url = `/clubs/${membership.club._id}`;
                                            return (
                                                <SidebarMenuItem key={membership.club._id}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={location.pathname === url}
                                                        className="cursor-default"
                                                    >
                                                        <span onClick={() => navigate(url)}>
                                                            {membership.club.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                )
                            : (
                                <div className="text-xs text-destructive p-2 inline-flex gap-2">
                                    <CircleXIcon className="size-4" /> {clubMemberships.message}
                                </div>
                            )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton asChild size="lg">
                                    <span>
                                        <UserCircleIcon />
                                        <div className="ml-2">
                                            <div>{data.name}</div>
                                            <div className="text-muted-foreground text-xs">{data.email}</div>
                                        </div>
                                        <ChevronUpIcon className="ml-auto" />
                                    </span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start">
                                <DropdownMenuItem
                                    onSelect={async () => {
                                        await api.post("user/logout");
                                        localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
                                        window.location.href = "/login";
                                    }}
                                >
                                    <LogOutIcon /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
