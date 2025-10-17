import { useAuth } from "@/hooks/auth";
import { format } from "date-fns/format";
import { isFuture } from "date-fns/isFuture";
import { isPast } from "date-fns/isPast";
import { isToday } from "date-fns/isToday";
import { CircleXIcon, LoaderIcon } from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { ClubContext } from "./club-context";

/** @typedef {"ongoing" | "upcoming" | "complete"} TournamentStatus */

/** @type {Record<TournamentStatus, Tourney.Tournament>} */
const TOURNAMENT_STATUS_LABELS = {
    complete: "Past",
    ongoing: "Ongoing",
    upcoming: "Upcoming",
};

export default function TournamentsList() {
    const { api } = useAuth();
    const { club, tournaments, setTournaments } = useContext(ClubContext);

    useEffect(() => {
        api.get(`club/${club.data._id}/tournaments`).json()
            .then((tournaments) => {
                setTournaments({
                    state: "resolved",
                    data: tournaments,
                });
            })
            .catch((error) => {
                console.error(error);
                setTournaments({
                    state: "rejected",
                    message: "Unable to retrieve club tournaments",
                });
            });
    }, []);

    if (tournaments.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (tournaments.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {tournaments.message}
            </div>
        );
    }

    if (tournaments.data.length === 0) {
        return <p className="text-muted-foreground">Your club never hosted a tournament before!</p>;
    }

    const groupedTournaments = tournaments.data.reduce(
        (grouped, tournament) => {
            const startTime = tournament.startTime == null ? null : new Date(tournament.startTime),
                endTime = tournament.endTime == null ? null : new Date(tournament.endTime);
            const status = inferStatusFromTime(startTime, endTime);
            grouped[status] ??= [];
            grouped[status].push(tournament);
            return grouped;
        },
        /** @type {Record<TournamentStatus, Tourney.Tournament[]>} */ ({
            ongoing: [],
            upcoming: [],
            complete: [],
        }), // note: that order matters in how they appear
    );

    return (
        <>
            {Object
                .entries(groupedTournaments)
                .map(([status, tournaments]) => {
                    if (tournaments.length == 0) {
                        return;
                    }
                    return (
                        <GroupedTournamentList
                            key={`tournament-group-${status}`}
                            status={status}
                            tournaments={tournaments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} // sort by most to least recently created
                            // todo: should probably change that sorting by most recently updated (updatedAt)
                        />
                    );
                })}
        </>
    );
}

/**
 * @param {{ status: TournamentStatus, tournaments: Tourney.Tournament[]}} param0
 */
function GroupedTournamentList({ status, tournaments }) {
    return (
        <div className="space-y-2">
            <div className="text-muted-foreground font-bold text-sm">{TOURNAMENT_STATUS_LABELS[status]}</div>
            <div className="grid grid-cols-2 gap-2">
                {tournaments.map((tournament) => (
                    <TournamentCard
                        key={"tournament-" + tournament._id}
                        status={status}
                        tournament={tournament}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * @param {Date | null} startTime
 * @param {Date | null} endTime
 *
 * @returns {TournamentStatus}
 */
function inferStatusFromTime(startTime, endTime) {
    // todo: what about "ends today"
    return startTime != null
        ? isFuture(startTime)
            ? "upcoming"
            : endTime == null
            ? isToday(startTime)
                ? "ongoing" // "starts today"
                : "ongoing"
            : isPast(endTime)
            ? "complete"
            : "ongoing"
        : "upcoming"; // "upcoming (no date set)"
}

/**
 * @param {{ status: TournamentStatus; tournament: Tourney.Tournament }} param0
 */
function TournamentCard({ status, tournament }) {
    const navigate = useNavigate();

    return (
        <div
            className="hover:bg-muted transition-colors duration-300 cursor-default border px-6 py-4 rounded-sm"
            onClick={() => navigate(`/tournaments/${tournament._id}`)}
        >
            <div className="font-medium text-lg">{tournament.name}</div>

            <div className="text-muted-foreground text-xs line-clamp-1">
                {tournament.startTime
                    ? ( // todo: make this date formatting more pretty and compact: oct 2, 2025 -- oct 3, 2025 should become oct 2-3, 2025
                        <span className="gap-x-1 flex">
                            <span>{format(tournament.startTime, "PP")}</span>
                            &mdash;
                            <span>
                                {tournament.endTime
                                    && format(tournament.endTime, "PP")}
                            </span>
                        </span>
                    )
                    : "No date yet"}
            </div>
        </div>
    );
}
