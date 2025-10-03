import { useContext } from "react";
import AddMemberDialog from "./AddMemberDialog";
import { ClubContext } from "./club-context";
import MembersTable from "./MembersTable";

export default function MembersSection() {
    const { club } = useContext(ClubContext);

    return (
        <div className="space-y-4">
            <div className="flex place-items-center justify-between gap-4">
                <div className="space-y-2">
                    <h3 className="font-medium text-xl">Members</h3>

                    <p className="text-sm">
                        You are{" "}
                        <span className="text-primary">
                            {club.data.membership.role === "owner" ? "the owner" : "an admin"}
                        </span>{" "}
                        of this club
                    </p>
                </div>

                <AddMemberDialog />
            </div>

            <MembersTable />
        </div>
    );
}
