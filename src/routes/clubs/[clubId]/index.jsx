import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { CircleXIcon } from "lucide-react";
import { LoaderIcon } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ClubContext } from "./club-context";
import DeleteClubDialog from "./DeleteClubDialog";
import MembersSection from "./MembersSection";
import PlayersSection from "./PlayersSection";
import TournamentsSection from "./TournamentsSection";

export default function ClubPage() {
    /** @type {Readonly<import("react-router").Params<"clubId">>} */
    const params = useParams();

    const { api } = useAuth();

    const [club, setClub] = useState(
        /**@type {LoadedData<Tourney.MyClub>} */ ({
            state: "pending",
            message: "Fetching club info",
        }),
    );

    const [clubMembers, setClubMembers] = useState(
        /**@type {LoadedData<Tourney.ClubMember[]>} */ ({
            state: "pending",
            message: "Fetching club members",
        }),
    );

    const [tournaments, setTournaments] = useState(
        /**@type {LoadedData<Tourney.Tournament[]>} */ ({
            state: "pending",
            message: "Fetching tournaments",
        }),
    );

    const [players, setPlayers] = useState(
        /**@type {LoadedData<Tourney.Player[]>} */ ({
            state: "pending",
            message: "Fetching players",
        }),
    );

    useEffect(() => {
        setClub({
            state: "pending",
            message: "Fetching club info",
        });

        api.get(`club/${params.clubId}`).json()
            .then((club) => {
                setClub({
                    state: "resolved",
                    data: club,
                });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setClub({
                    state: "rejected",
                    message: "Failed to get club info",
                });
            });
    }, [params.clubId]);

    if (club.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (club.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {club.message}
            </div>
        );
    }

    return (
        <ClubContext.Provider
            value={{
                club: club,
                setClub: setClub,

                clubMembers: clubMembers,
                setClubMembers: setClubMembers,

                tournaments: tournaments,
                setTournaments: setTournaments,

                players: players,
                setPlayers: setPlayers,
            }}
        >
            <title>{`@${club.data.handle} \u2027 Fixtures`}</title>
            <div className="space-y-8">
                <div className="flex justify-between place-items-center gap-2">
                    <div className="">
                        <h2 className="font-semibold text-2xl">{club.data.name}</h2>
                        <div className="text-muted-foreground">@{club.data.handle}</div>
                    </div>
                    <Button variant="outline" size="icon">
                        <GlobeIcon />
                        {/* todo: link to public profile */}
                    </Button>
                </div>

                <TournamentsSection />

                {(club.data.membership.role === "admin" || club.data.membership.role === "owner")
                    && <PlayersSection />}

                {(club.data.membership.role === "admin" || club.data.membership.role === "owner")
                    && <MembersSection />}

                {club.data.membership.role === "owner"
                    && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-xl">Settings</h3>

                            <div className="grid border rounded-sm divide-y *:p-4">
                                <div className="justify-between flex place-items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="">Change club name</div>
                                        <p className="text-muted-foreground text-sm text-pretty">
                                            You can change the name of your club but not the handle. Your club's public
                                            profile page will still be accessible via the handle.
                                        </p>
                                    </div>
                                    <Button variant="outline">Rename</Button>
                                </div>

                                <div className="justify-between flex place-items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="">Transfer club to someone else</div>
                                        <p className="text-muted-foreground text-sm text-pretty">
                                            <span className="font-medium text-destructive">Careful!</span>{" "}
                                            Transfer your ownership of the club to someone else. This will make you a
                                            normal member in the club and you won't be able to manage the club anymore.
                                        </p>
                                    </div>
                                    <Button variant="destructive">Transfer</Button>
                                </div>

                                <div className="justify-between flex place-items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="">Delete club permanently</div>
                                        <p className="text-muted-foreground text-sm  text-pretty">
                                            <span className="font-medium text-destructive">Careful!</span>{" "}
                                            Deleting your club will destroy all the records including members,
                                            tournaments and matches related to it.
                                        </p>
                                    </div>
                                    <DeleteClubDialog club={club} />
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </ClubContext.Provider>
    );
}
