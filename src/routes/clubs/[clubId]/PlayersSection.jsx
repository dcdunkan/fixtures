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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ClubContext } from "./club-context";
import PlayersTable from "./PlayersTable";

export default function PlayersSection() {
    return (
        <div className="space-y-4">
            <div className="flex place-items-center justify-between gap-4">
                <div className="space-y-2">
                    <h3 className="font-medium text-xl">Players</h3>
                </div>

                <div>
                    <CreatePlayerFormDialog />
                </div>
            </div>

            <PlayersTable />
        </div>
    );
}

const CREATE_PLAYER_SCHEMA = z.object({
    name: z.string().min(3),
});

function CreatePlayerFormDialog() {
    const { api } = useAuth();
    const {
        club,
        players,
        setPlayers,
    } = useContext(ClubContext);

    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm({
        resolver: zodResolver(CREATE_PLAYER_SCHEMA),
        defaultValues: {
            name: "",
        },
    });

    /** @param {z.infer<typeof CREATE_PLAYER_SCHEMA>} values */
    function onSubmit(values) {
        if (isCreating) return;
        setIsCreating(true);

        api.post("player/create", {
            json: {
                name: values.name,
                clubId: club.data._id,
            },
        }).json().then((player) => {
            toast.success("Done!");
            if (players.state === "resolved") {
                setPlayers({
                    state: "resolved",
                    data: [...players.data, {
                        _id: player.playerId,
                        name: values.name,
                    }],
                });
            }
            setIsOpen(false);
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then((result) => toast.error(result.message));
                return;
            }
            toast.error(error.message);
        }).finally(() => {
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
                    form.reset();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon /> Create Player
                </Button>
            </DialogTrigger>
            <Form {...form}>
                <form>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Player</DialogTitle>
                            <DialogDescription>
                                You can assign players to teams in the tournaments page.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Player name</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="off" placeholder="E.g.: Swassy" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isCreating}>Close</Button>
                            </DialogClose>
                            <Button
                                disabled={isCreating}
                                onClick={async () => {
                                    await form.trigger();
                                    if (form.formState.isValid) {
                                        await form.handleSubmit(onSubmit)();
                                    }
                                }}
                            >
                                {isCreating
                                    ? <LoaderIcon className="animate-spin" />
                                    : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Form>
        </Dialog>
    );
}
