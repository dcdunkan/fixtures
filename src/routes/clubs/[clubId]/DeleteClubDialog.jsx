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
import { useAuth } from "@/hooks/auth";
import { useGlobalState } from "@/hooks/global-state";
import { LoaderIcon } from "lucide-react";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * @param {{ club: LoadedResolved<Tourney.Club & {role: Tourney.MyClubMembership["role"]}> }} param0
 * @returns {import("react").JSX.Element}
 */
export default function DeleteClubDialog({ club }) {
    const { api } = useAuth();
    const { clubs, setClubs } = useGlobalState();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    function deleteClub() {
        if (isDeleting) return;

        setIsDeleting(true);

        api.delete(`club/delete/${club.data._id}`)
            .json()
            .then((response) => {
                toast.success(response.message);

                if (clubs.state === "resolved") {
                    setClubs({
                        state: "resolved",
                        data: clubs.data.filter((c) => c._id !== club.id),
                    });
                }

                setIsOpen(false);
                navigate("/clubs");
            })
            .catch((error) => {
                // todo: fix this shit
                console.error(error);
                toast.error(error.message);
            })
            .finally(() => {
                setIsDeleting(false);
            });
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpening) => {
                if (isDeleting && isOpen) {
                    return;
                }
                setIsOpen(isOpening);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2Icon /> Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Permanently delete this club?</DialogTitle>
                    <DialogDescription>
                        This action is not reversible. Think twice before you click confirm.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button onClick={deleteClub} disabled={isDeleting}>
                        {isDeleting
                            ? <LoaderIcon className="animate-spin" />
                            : "Confirm deletion"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
