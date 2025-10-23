import { format } from "date-fns/format";
import { useNavigate } from "react-router";

/**
 * @param {{ tournaments: Tournament[] }} param0
 * @returns {import("react").JSX.Element}
 */
export default function OngoingTournamentsList({ tournaments }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-2">
            {tournaments.map((tournament) => {
                const start = new Date(tournament.startTime);
                const end = tournament.endTime ? new Date(tournament.endTime) : null;
                const ongoing = !end || (start <= new Date() && end >= new Date());

                return (
                    <div
                        key={"tournament-" + tournament._id}
                        className={`hover:bg-muted transition-colors duration-300 cursor-default border px-6 py-4 rounded-sm`}
                        onClick={() => navigate("tournaments/" + tournament._id)}
                    >
                        <div className="font-semibold text-lg">{tournament.name}</div>
                        <div className="text-muted-foreground text-sm">
                            {tournament.startTime
                                ? (
                                    <span className="gap-x-1 flex">
                                        <span>{format(start, "PP")}</span>
                                        &mdash;
                                        <span>
                                            {end
                                                && format(end, "PP")}
                                        </span>
                                    </span>
                                )
                                : "No start time"}
                        </div>
                        {ongoing && (
                            <div className="mt-1 font-medium text-sm text-red-600">
                                <span className="animate-pulse">Live Now</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
