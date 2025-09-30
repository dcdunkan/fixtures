import { Button, buttonVariants } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { CircleXIcon, LoaderIcon, MoreVerticalIcon, UserPlusIcon } from "lucide-react";
import { ArrowUpCircleIcon } from "lucide-react";
import { ArrowDownCircleIcon } from "lucide-react";
import { ArrowDownIcon } from "lucide-react";
import { ArrowUpIcon } from "lucide-react";
import { CircleMinusIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ClubContext } from "./club-context";

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

function AddMemberDialog() {
    const { club, clubMembers, setClubMembers } = useContext(ClubContext);
    const { api } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const [userHandle, setUserHandle] = useState("");
    const [inviteUserRole, setInviteUserRole] = useState(
        /** @type {Tourney.ClubMemberRole} */ ("member"),
    );
    const [errorMessage, setErrorMessage] = useState("");

    const [isAdding, setIsAdding] = useState(false);

    function addUserToClub() {
        if (
            typeof userHandle !== "string"
            || userHandle.trim().length === 0
        ) {
            setErrorMessage("User handle or email cannot be empty");
            return;
        }
        if (inviteUserRole !== "member" && inviteUserRole !== "admin") {
            setErrorMessage("User can only be invited as an admin or a member");
            return;
        }

        if (isAdding) return;

        setIsAdding(true);

        api.post(`club/${club.data._id}/add-member`, {
            json: {
                query: userHandle,
                role: inviteUserRole,
            },
        })
            .json()
            .then((result) => {
                if (clubMembers.state === "resolved") {
                    setClubMembers({
                        state: "resolved",
                        data: [...clubMembers.data, {
                            _id: result._id,
                            joined_at: result.joined_at,
                            role: result.role,
                            user: result.user,
                        }],
                    });
                }

                setIsOpen(false);
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then((result) => toast.error(result.message));
                    return;
                }
                toast.error(error.message);
            })
            .finally(() => {
                setIsAdding(false);
            });
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpening) => {
                if (isAdding && isOpen) {
                    return;
                }
                setIsOpen(isOpening);

                if (isOpening) {
                    setUserHandle("");
                    setInviteUserRole("member");
                    setErrorMessage("");
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <UserPlusIcon /> Add member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new member</DialogTitle>
                    <DialogDescription>
                        Invite someone as member or admin to help you with managing this club and it's tournaments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="gap-2 flex place-items-center">
                        <Input
                            type="text"
                            placeholder="Search by username or email"
                            value={userHandle}
                            onChange={(event) => {
                                setUserHandle(event.target.value);
                            }}
                        />
                        <Select defaultValue="member" onValueChange={(v) => setInviteUserRole(v)}>
                            <SelectTrigger className="w-1/3">
                                <SelectValue placeholder="User Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {errorMessage
                        && (
                            <p className="text-muted-foreground text-xs px-1">
                                {errorMessage}
                            </p>
                        )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isAdding}>
                        Cancel
                    </Button>
                    <Button onClick={addUserToClub} disabled={isAdding}>
                        {isAdding
                            ? <LoaderIcon className="animate-spin" />
                            : (
                                <span>
                                    Add to club as <span className="lowercase">{inviteUserRole}</span>
                                </span>
                            )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MembersTable() {
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
                                        : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                                                >
                                                    <MoreVerticalIcon />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="left">
                                                    <DropdownMenuLabel className="text-center">
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            alert("todo");
                                                        }}
                                                    >
                                                        {member.role === "admin"
                                                            ? (
                                                                <>
                                                                    <ArrowDownIcon /> Demote
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <ArrowUpIcon /> Promote
                                                                </>
                                                            )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            alert("todo");
                                                        }}
                                                    >
                                                        <CircleMinusIcon /> Kick from club
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
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
