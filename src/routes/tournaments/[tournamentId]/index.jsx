import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { format } from "date-fns/format";
import { HTTPError } from "ky";
import { CircleXIcon, GlobeIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { TournamentContext } from "./tournament-context";

export default function TournamentPage() {
    /** @type {Readonly<import("react-router").Params<"tournamentId">>} */
    const params = useParams();

    const { api } = useAuth();

    const [tournament, setTournament] = useState(
        /**@type {LoadedData<Tourney.Tournament>} */ ({
            state: "pending",
            message: "Fetching tournament info",
        }),
    );

    useEffect(() => {
        setTournament({
            state: "pending",
            message: "Fetching tournament info",
        });

        api.get(`tournaments/${params.tournamentId}`).json()
            .then((tournament) => {
                setTournament({
                    state: "resolved",
                    data: tournament,
                });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setTournament({
                    state: "rejected",
                    message: "Failed to get tournament info",
                });
            });
    }, [params.tournamentId]);

    if (tournament.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (tournament.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {tournament.message}
            </div>
        );
    }

    return (
        <TournamentContext.Provider
            value={{
                tournament: tournament,
                setTournament: setTournament,
            }}
        >
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between place-items-center gap-2">
                        <div className="">
                            <h2 className="font-semibold text-2xl">{tournament.data.name}</h2>
                            <div className="text-muted-foreground"></div>
                        </div>
                        <Button variant="outline" size="icon">
                            <GlobeIcon />
                            {/* todo: link to public profile */}
                        </Button>
                    </div>
                    <div>
                        {tournament.data.startTime
                            ? (
                                <span className="gap-x-1 flex">
                                    <span>{format(tournament.data.startTime, "PP")}</span>
                                    &mdash;
                                    <span>
                                        {tournament.data.endTime
                                            && format(tournament.data.endTime, "PP")}
                                    </span>
                                </span>
                            )
                            : "No date yet"}
                    </div>
                </div>

                <div>
                    {JSON.stringify(tournament, null, 2)}
                </div>
            </div>
        </TournamentContext.Provider>
    );
}
