import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { LoaderIcon, UserPlusIcon } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { ClubContext } from "./club-context";

export default function AddMemberDialog() {
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

        api.post(`club/${club.data._id}/member`, {
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
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isAdding}>
                            Cancel
                        </Button>
                    </DialogClose>
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
