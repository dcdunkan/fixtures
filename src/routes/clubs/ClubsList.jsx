import { useNavigate } from "react-router";
import { Link } from "react-router";

/**
 * @param {{ clubMemberships: Tourney.MyClubMembership[] }} param0
 * @returns {import("react").JSX.Element}
 */
export default function ClubsList({ clubMemberships }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-2">
            {clubMemberships.map(({ club }, i) => {
                return (
                    <div
                        key={"club-" + club._id}
                        className="hover:bg-muted transition-colors duration-300 cursor-default border px-6 py-4 rounded-sm"
                        onClick={() => navigate(club._id)}
                    >
                        <div className="font-semibold text-lg">{club.name}</div>
                        <div className="text-muted-foreground text-sm">@{club.handle}</div>
                    </div>
                );
            })}
        </div>
    );
}
