import { useAuth } from "@/hooks/auth";
import { ACCESS_TOKEN_LOCAL_STORAGE } from "@/lib/constants";
import { PlusIcon } from "lucide-react";
import { UserIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";
import { RadioIcon } from "lucide-react";
import { SettingsIcon } from "lucide-react";
import { TrophyIcon } from "lucide-react";
import { HouseIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function Home() {
    const { data, api } = useAuth();

    const [query, setQuery] = useState("");
    const [tournaments, setTournaments] = useState([
        {
            id: 1,
            title: "Summer Championship",
            game: "League of Legends",
            players: 32,
            date: "2024-01-15",
            status: "live",
        },
        {
            id: 2,
            title: "Weekly Valorant Cup",
            game: "Valorant",
            players: 16,
            date: "2024-01-20",
            status: "upcoming",
        },
    ]);

    const filtered = tournaments.filter((t) => (t.title + t.game).toLowerCase().includes(query.toLowerCase()));

    function handleCreate() {
        const nextId = tournaments.length + 1;
        const newT = {
            id: nextId,
            title: `New Tournament ${nextId}`,
            game: "TBD",
            players: 0,
            date: new Date().toISOString().slice(0, 10),
            status: "upcoming",
        };
        setTournaments([newT, ...tournaments]);
    }

    function handleView(id) {
        alert("View tournament id: " + id);
    }

    function handleEdit(id) {
        alert("Edit tournament id: " + id);
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="bg-sidebar text-sidebar-foreground w-64 p-4 flex flex-col">
                <div className="text-xl font-bold mb-6">Fixtures</div>
                <nav className="flex flex-col gap-2 flex-1">
                    <a href="/" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <HouseIcon className="size-5" /> Home
                    </a>
                    <a href="#" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <TrophyIcon className="size-5" /> Tournaments
                    </a>
                    <a href="#" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <PlusIcon /> Create Tournament
                    </a>
                    <a href="#" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <RadioIcon /> Live Now
                    </a>
                    <a href="#" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <UserIcon /> Profile
                    </a>
                    <a href="#" className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center">
                        <SettingsIcon /> Settings
                    </a>
                </nav>
                <button
                    className="hover:bg-sidebar-accent p-2 rounded flex gap-2 place-items-center cursor-pointer"
                    onClick={async () => {
                        await api.post("user/logout");
                        localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
                        window.location.href = "/login";
                    }}
                >
                    <LogOutIcon /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="flex justify-end p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <span>{data?.name}</span>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="p-6 bg-card text-card-foreground">
                    <h1 className="text-3xl font-bold mb-2">Track. Manage. Compete.</h1>
                    <p className="mb-4">
                        Create and manage tournaments, compete with players worldwide, and watch live competitions.
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="bg-primary text-primary-foreground px-4 py-2 rounded"
                            onClick={handleCreate}
                        >
                            + Create Tournament
                        </button>
                        <input
                            type="text"
                            placeholder="Search tournaments..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="border border-input rounded px-2 py-1"
                        />
                    </div>
                </section>

                {/* Tournaments */}
                <section className="p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Your Tournaments</h2>
                        <button className="text-sm underline">View All</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((t) => (
                            <div
                                key={t.id}
                                className="bg-card text-card-foreground p-4 rounded shadow"
                            >
                                <h3 className="font-bold text-lg flex justify-between items-center">
                                    {t.title}
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            t.status === "live"
                                                ? "bg-green-500 text-white"
                                                : "bg-yellow-500 text-black"
                                        }`}
                                    >
                                        {t.status}
                                    </span>
                                </h3>
                                <p className="text-sm">{t.game}</p>
                                <div className="text-xs mt-2">
                                    {t.players} players | {t.date}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleView(t.id)}
                                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleEdit(t.id)}
                                        className="bg-accent text-accent-foreground px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full p-4 text-center">
                                No tournaments match your search.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
