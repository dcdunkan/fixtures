import { useContext } from "react";
import { ClubContext } from "./club-context";
import CreateTournamentDialog from "./CreateTournamentDialog";
import TournamentsList from "./TournamentList";

export default function TournamentsSection() {
    const { tournaments, club } = useContext(ClubContext);

    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between place-items-center gap-4">
                <h3 className="font-medium text-xl">Tournaments</h3>

                {club.data.membership.role !== "member"
                    && (
                        <div>
                            <CreateTournamentDialog />
                        </div>
                    )}
            </div>

            <TournamentsList />
        </div>
    );
}
