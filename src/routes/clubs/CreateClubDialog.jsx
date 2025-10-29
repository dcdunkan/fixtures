import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { useGlobalState } from "@/hooks/global-state";
import { LoaderIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateClubDialog() {
    const { api, data } = useAuth();
    const { clubs, setClubs } = useGlobalState();

    const [isOpen, setIsOpen] = useState(false);
    const [newClubDetails, setNewClubDetails] = useState({
        name: "",
        handle: "",
    });
    const [isCreating, setIsCreating] = useState(false);

    function registerClub() {
        // todo: validate

        if (isCreating) return;

        setIsCreating(true);

        api.post("club", {
            json: {
                name: newClubDetails.name,
                handle: newClubDetails.handle,
            },
        })
            .json()
            .then((result) => {
                if (clubs.state === "resolved") {
                    setClubs({
                        state: "resolved",
                        data: clubs.data.concat({
                            _id: result.memberId,
                            clubId: result.clubId,
                            userId: data.id,
                            role: "owner",
                            status: "active",
                            club: {
                                _id: result.clubId,
                                name: newClubDetails.name,
                                handle: newClubDetails.handle,
                            },
                            joined_at: new Date(),
                        }),
                    });
                }

                setIsOpen(false);
            })
            .catch((response) => {
                toast.error(response.message);
            })
            .finally(() => {
                setIsCreating(false);
            });
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpening) => {
                if (isCreating && isOpen) {
                    return;
                }
                setIsOpen(isOpening);

                if (isOpening) {
                    setNewClubDetails({ name: "", handle: "" });
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusIcon /> Create
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new club</DialogTitle>
                    <DialogDescription>
                        Register your new club here.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Club name"
                            value={newClubDetails.name}
                            onChange={(event) => {
                                setNewClubDetails({
                                    ...newClubDetails,
                                    name: event.currentTarget.value,
                                });
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Club handle (must be unique)"
                            value={newClubDetails.handle}
                            onChange={(event) => {
                                setNewClubDetails({
                                    ...newClubDetails,
                                    handle: event.currentTarget.value,
                                });
                            }}
                        />
                        <p className="text-muted-foreground text-xs px-1">
                            Club handle helps to uniquely identify the club. Your public tournaments will be hosted
                            under{" "}
                            <span className="font-medium text-primary">
                                https://{window.location.origin}/@{newClubDetails.handle
                                    || "<handle goes here>"}/tournaments
                            </span>.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={registerClub} disabled={isCreating}>
                        {isCreating
                            ? <LoaderIcon className="animate-spin" />
                            : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
