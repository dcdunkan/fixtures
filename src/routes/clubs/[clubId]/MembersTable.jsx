import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { CircleXIcon, LoaderIcon, MoreVerticalIcon } from "lucide-react";
import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ClubContext } from "./club-context";
import MemberRowDropdownMenu from "./MemberRowDropdownMenu";

export default function MembersTable() {
    const { club, clubMembers, setClubMembers } = useContext(ClubContext);
    /** @type {ReturnType<typeof useParams<"clubId">>} */
    const params = useParams();
    const { api } = useAuth();

    useEffect(() => {
        api.get(`club/${params.clubId}/members`).json()
            .then((clubMembers) => {
                setClubMembers({
                    state: "resolved",
                    data: clubMembers,
                });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setClubMembers({
                    state: "rejected",
                    message: "Failed to get club members",
                });
            });
    }, [club]);

    if (clubMembers.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (clubMembers.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {clubMembers.message}
            </div>
        );
    }

    return (
        <>
            {/* todo: filter */}
            <div className="border rounded-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-muted-foreground">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Joined on</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clubMembers.data.map((member, i) => (
                            <TableRow key={`clubmember-${member._id}`}>
                                <TableCell className="text-center">{i + 1}</TableCell>
                                <TableCell>{member.user.name}</TableCell>
                                <TableCell className="capitalize">
                                    {member.role}
                                </TableCell>
                                <TableHead className="text-right">
                                    {new Date(member.joined_at)
                                        .toLocaleDateString()}
                                </TableHead>
                                <TableCell className="text-right">
                                    {member.role === "owner"
                                        ? (
                                            <Button size="icon" variant="ghost" disabled>
                                                <MoreVerticalIcon />
                                            </Button>
                                        )
                                        : <MemberRowDropdownMenu member={member} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {clubMembers.data.length === 1
                && (
                    <p className="text-muted-foreground text-sm">
                        It's pretty lonely up here, invite someone to help you with managing tournaments!
                    </p>
                )}
        </>
    );
}
