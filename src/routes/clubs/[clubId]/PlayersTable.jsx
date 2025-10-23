import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { CircleMinusIcon, CircleXIcon, LoaderIcon, MoreVerticalIcon, PenIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ClubContext } from "./club-context";

export default function PlayersTable() {
    const {
        club,
        players,
        setPlayers,
    } = useContext(ClubContext);
    /** @type {Readonly<import("react-router").Params<"clubId">>>} */
    const params = useParams();
    const { api } = useAuth();

    const [filterString, setFilterString] = useState("");

    useEffect(() => {
        api.get(`club/${params.clubId}/players`).json()
            .then((players) => {
                setPlayers({ state: "resolved", data: players });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setPlayers({ state: "rejected", message: "Failed to get club players" });
            });
    }, [club]);

    if (players.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (players.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {players.message}
            </div>
        );
    }

    return (
        <>
            {/* todo: filter */}
            <SearchInput placeholder="Find players..." query={filterString} setQuery={setFilterString} />
            <div className="border rounded-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center w-min max-w-min text-muted-foreground">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.data
                            .filter((player) => player.name.toLowerCase().includes(filterString.toLowerCase()))
                            .map((player, i) => (
                                <TableRow key={`clubplayer-${player._id}`}>
                                    <TableCell className="text-center  w-min max-w-min">{i + 1}</TableCell>
                                    <TableCell>{player.name}</TableCell>

                                    <TableCell className="text-right">
                                        <PlayerRowDropdownMenu player={player} />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {players.data.length === 1
                && (
                    <p className="text-muted-foreground text-sm">
                        It's pretty lonely up here, invite someone to help you with managing tournaments!
                    </p>
                )}
        </>
    );
}

/**
 * @param {{ player: Tourney.Player }} param0
 * @returns {import("react").JSX.Element}
 */
function PlayerRowDropdownMenu({ player }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                </Button>
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
                    <PenIcon /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => {
                        alert("todo");
                    }}
                >
                    <CircleMinusIcon /> Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
