import { useAuth } from "@/hooks/auth";
import { useGlobalState } from "@/hooks/global-state";
import { CircleXIcon } from "lucide-react";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import ClubsList from "./ClubsList";
import CreateClubDialog from "./CreateClubDialog";

export default function ClubsPage() {
    const { api } = useAuth();
    const { clubs, setClubs } = useGlobalState();

    useEffect(() => {
        api.get("clubs").json()
            .then((clubs) => {
                setClubs({
                    state: "resolved",
                    data: clubs,
                });
            })
            .catch((error) => {
                console.error(error);
                setClubs({
                    state: "rejected",
                    message: "Unable to retrieve clubs",
                });
            });
    }, []);

    return (
        <div className="space-y-8">
            <title>Your clubs &middot; Fixtures</title>

            <div className="space-y-4">
                <div className="flex place-items-center justify-between">
                    <h2 className="font-bold text-2xl">Your Clubs</h2>
                    <CreateClubDialog />
                </div>

                <div>
                    {clubs.state === "pending"
                        ? (
                            <div className="text-muted-foreground inline-flex gap-2 place-items-center">
                                <LoaderCircleIcon className="animate-spin size-4" /> {clubs.message}
                            </div>
                        )
                        : clubs.state === "resolved"
                        ? clubs.data.length === 0
                            ? (
                                <div className="text-muted-foreground">
                                    You are not part of any club yet. Create one or get invited to one to create and
                                    manage tournaments!
                                </div>
                            )
                            : <ClubsList clubMemberships={clubs.data} />
                        : (
                            <div className="text-destructive inline-flex gap-2 place-items-center">
                                <CircleXIcon className="size-4" /> {clubs.message}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
