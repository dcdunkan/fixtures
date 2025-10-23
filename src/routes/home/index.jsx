import { useAuth } from "@/hooks/auth";
import { CircleXIcon } from "lucide-react";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import OngoingTournamentsList from "./OngoingTournamentsList";

export default function HomePage() {
    const { data, api } = useAuth();
    const [clubs, setClubs] = useState({
        state: "pending",
        message: "Loading clubs...",
        data: [],
    });

    useEffect(() => {
        api
            .get("user/tournaments")
            .json()
            .then((clubsData) => {
                setClubs({
                    state: "resolved",
                    data: clubsData,
                });
            })
            .catch((error) => {
                console.error(error);
                setClubs({
                    state: "rejected",
                    message: "Unable to retrieve clubs",
                    data: [],
                });
            });
    }, [api]);

    return (
        <div className="space-y-4">
            <title>Fixtures</title>
            <h2 className="font-semibold text-4xl">Welcome, {data.name}!</h2>
            <div>
                {clubs.state === "pending"
                    ? (
                        <div className="text-muted-foreground inline-flex gap-2 place-items-center">
                            <LoaderCircleIcon className="animate-spin size-4" /> {clubs.message}
                        </div>
                    )
                    : clubs.state === "resolved"
                    ? (
                        clubs.data.length === 0
                            ? (
                                <div className="text-muted-foreground">
                                    You are not part of any club yet. Create one to get started!
                                </div>
                            )
                            : <OngoingTournamentsList tournaments={clubs.data} />
                    )
                    : (
                        <div className="text-destructive inline-flex gap-2 place-items-center">
                            <CircleXIcon className="size-4" /> {clubs.message}
                        </div>
                    )}
            </div>
        </div>
    );
}
