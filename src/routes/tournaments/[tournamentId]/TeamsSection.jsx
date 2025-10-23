import { SearchInput } from "@/components/SearchInput";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { CircleXIcon, LoaderCircleIcon, LoaderIcon, MinusIcon, PlusIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { TournamentContext } from "./tournament-context";

export function TeamsSection() {
    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between place-items-center gap-4">
                <h3 className="font-medium text-xl">Teams</h3>
                <div>
                    <CreateTeamFormDialog />
                </div>
            </div>

            <TeamsTable />
        </div>
    );
}

const CREATE_TEAM_SCHEMA = z.object({
    name: z.string().min(3),
});

function CreateTeamFormDialog() {
    const { api } = useAuth();
    const {
        tournament,
        teams,
        setTeams,
    } = useContext(TournamentContext);

    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm({
        resolver: zodResolver(CREATE_TEAM_SCHEMA),
        defaultValues: {
            name: "",
        },
    });

    /** @param {z.infer<typeof CREATE_TEAM_SCHEMA>} values */
    function onSubmit(values) {
        if (isCreating) return;
        setIsCreating(true);

        api.post("team/create", {
            json: {
                name: values.name,
                tournamentId: tournament.data._id,
            },
        }).json().then((team) => {
            toast.success("Done!");
            if (teams.state === "resolved") {
                setTeams({
                    state: "resolved",
                    data: [...teams.data, {
                        _id: team.teamId,
                        tournamentId: tournament.data._id,
                        name: values.name,
                        teamStats: {
                            draws: 0,
                            goalsAgainst: 0,
                            goalsFor: 0,
                            losses: 0,
                            matchesPlayed: 0,
                            points: 0,
                            wins: 0,
                        },
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
                    <PlusIcon /> Create team
                </Button>
            </DialogTrigger>
            <Form {...form}>
                <form>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Team</DialogTitle>
                            <DialogDescription>
                                You can assign club players to the team after creating the team.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Club name</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="off" placeholder="Team 1" {...field} />
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

function TeamsTable() {
    const { api } = useAuth();
    const {
        tournament,
        teams,
        setTeams,
    } = useContext(TournamentContext);

    useEffect(() => {
        if (tournament.state !== "resolved") return;

        api.get(`tournaments/${tournament.data._id}/teams`).json()
            .then((teams) => {
                setTeams({ state: "resolved", data: teams });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setTeams({ state: "rejected", message: "Failed to fetch teams" });
            });
    }, [tournament]);

    const [selectedTeam, setSelectedTeam] = useState(/** @type {Tourney.Team | null} */ (null));

    const [filterString, setFilterString] = useState("");

    if (teams.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (teams.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {teams.message}
            </div>
        );
    }

    if (teams.data.length === 0) {
        return (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                No teams have been created.
            </div>
        );
    } else {
        return (
            <>
                <SearchInput placeholder="Find teams..." query={filterString} setQuery={setFilterString} />

                <TeamDetailsDialog selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />

                <div className="border rounded-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center text-muted-foreground w-min max-w-min shrink">
                                    #
                                </TableHead>
                                <TableHead>Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teams.data
                                .filter((team) => team.name.toLowerCase().includes(filterString.toLowerCase()))
                                .map((team, i) => (
                                    <TableRow
                                        key={`team-${team._id}`}
                                        onClick={() => {
                                            setSelectedTeam(team);
                                        }}
                                    >
                                        <TableCell className="text-center text-muted-foreground w-min max-w-min shrink">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>{team.name}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </>
        );
    }
}

/**
 * @param {{
 * selectedTeam: Tourney.Team;
 * setSelectedTeam: React.Dispatch<React.SetStateAction<Tourney.Team>>;
 * }} param0
 * @returns
 */
function TeamDetailsDialog({ selectedTeam, setSelectedTeam }) {
    const { api } = useAuth();
    const { tournament } = useContext(TournamentContext);

    const [clubPlayersMap, setClubPlayersMap] = useState(
        /** @type {LoadedData<Record<string, Tourney.Player>>} */ ({
            state: "pending",
            message: "Fetching club players",
        }),
    );

    const [teamPlayers, setTeamPlayers] = useState(
        /** @type {LoadedData<Tourney.TeamXPlayer[]>} */ ({
            state: "pending",
            message: "Fetching team players",
        }),
    );

    const [allPlayingPlayers, setAllPlayingPlayers] = useState(
        /** @type {LoadedData<Record<string, {name: string, id: string}>>} */ ({
            state: "pending",
            message: "Fetching playing players",
        }),
    );

    useEffect(() => {
        if (selectedTeam == null) return;

        setClubPlayersMap({ state: "pending", message: "Fetching club players" });
        setTeamPlayers({ state: "pending", message: "Fetching team players" });
        setAllPlayingPlayers({ state: "pending", message: "Fetching playing players" });

        api.get(`club/${tournament.data.clubId}/players`).json().then((clubPlayers) => {
            setClubPlayersMap({
                state: "resolved",
                data: clubPlayers.reduce((p, c) => {
                    return { ...p, [c._id]: c };
                }, {}),
            });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then(({ message }) => toast.error(message));
            }
            setClubPlayersMap({ state: "rejected", message: "Failed to fetch club players" });
        });

        api.get(`team/${selectedTeam._id}/players`).json().then((players) => {
            setTeamPlayers({ state: "resolved", data: players });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then(({ message }) => toast.error(message));
            }
            setTeamPlayers({ state: "rejected", message: "Failed to fetch team players" });
        });

        api.get(`player/${tournament.data._id}/assigned`).json().then(
            (/** @type {{ teamId: string; name: string; playerIds: string[] }[]} */ teams) => {
                setAllPlayingPlayers({
                    state: "resolved",
                    data: teams.reduce((map, team) => {
                        for (const playerId of team.playerIds) {
                            map[playerId] = { id: team.teamId, name: team.name };
                        }
                        return map;
                    }, /** @type {Record<string, {name: string, id: string}>} */ ({})),
                });
            },
        ).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then(({ message }) => toast.error(message));
            }
            setAllPlayingPlayers({ state: "rejected", message: "Failed to fetch all assigned players" });
        });
    }, [selectedTeam]);

    return (
        <Dialog
            open={selectedTeam != null}
            onOpenChange={(isOpening) => {
                if (!isOpening) {
                    setSelectedTeam(null);
                }
            }}
        >
            <DialogContent className="flex h-[80vh] max-w-[90vw] flex-col rounded-md transition-all duration-150 sm:max-w-lg">
                {selectedTeam
                    && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedTeam.name}</DialogTitle>
                                <DialogDescription>Team description</DialogDescription>
                            </DialogHeader>

                            <div className="flex-grow overflow-y-scroll rounded border">
                                {teamPlayers.state === "pending"
                                    ? (
                                        <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-sm">
                                            <LoaderIcon className="animate-spin size-5" />
                                        </div>
                                    )
                                    : teamPlayers.state === "rejected"
                                    ? (
                                        <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-sm gap-2">
                                            <CircleXIcon className="size-5" /> {teamPlayers.message}
                                        </div>
                                    )
                                    : (
                                        <>
                                            <div>
                                                <div className="p-2 text-sm uppercase text-muted-foreground border-b">
                                                    In team ({teamPlayers.data.length})
                                                </div>
                                                {teamPlayers.data.length === 0
                                                    ? (
                                                        <div className="flex flex-col justify-center items-center p-8 text-muted-foreground text-sm">
                                                            No player has been assigned to this team.
                                                        </div>
                                                    )
                                                    : clubPlayersMap.state === "resolved"
                                                    ? (
                                                        <div className="divide-y">
                                                            <AssignedPlayerList
                                                                players={teamPlayers.data
                                                                    .map(({ playerId }) =>
                                                                        clubPlayersMap.data[playerId]
                                                                    )
                                                                    .filter((player) => player != null)}
                                                                selectedTeam={selectedTeam}
                                                                setTeamPlayers={setTeamPlayers}
                                                                setAllPlayingPlayers={setAllPlayingPlayers}
                                                            />
                                                        </div>
                                                    )
                                                    : (
                                                        <div className="flex flex-col justify-center items-center p-8 text-muted-foreground text-sm">
                                                            Loading player details...
                                                        </div>
                                                    )}
                                            </div>

                                            {clubPlayersMap.state === "pending"
                                                ? (
                                                    <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-sm">
                                                        <LoaderIcon className="animate-spin size-5" />
                                                    </div>
                                                )
                                                : clubPlayersMap.state === "rejected"
                                                ? (
                                                    <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-sm gap-2">
                                                        <CircleXIcon className="size-5" /> {clubPlayersMap.message}
                                                    </div>
                                                )
                                                : (
                                                    <div>
                                                        <div className="p-2 text-sm uppercase text-muted-foreground border-b">
                                                            ASSIGNABLE FROM CLUB ({Object.keys(clubPlayersMap.data)
                                                                .filter((player) =>
                                                                    teamPlayers.data.find((tp) =>
                                                                        tp.playerId === player
                                                                    ) == null
                                                                ).length})
                                                        </div>
                                                        {Object.keys(clubPlayersMap.data).filter((playerId) => {
                                                                return teamPlayers.data.find((tp) =>
                                                                    tp.playerId === playerId
                                                                ) == null;
                                                            }).length === 0
                                                            ? (
                                                                <div className="flex flex-col justify-center items-center p-8 text-muted-foreground text-sm text-center">
                                                                    Go to the club page to create players.
                                                                    <br />
                                                                    Come back and assign them here.
                                                                </div>
                                                            )
                                                            : (
                                                                <UnassignedPlayerList
                                                                    players={Object
                                                                        .values(clubPlayersMap.data)
                                                                        .filter((player) => {
                                                                            return teamPlayers.data.find((tp) =>
                                                                                tp.playerId === player._id
                                                                            ) == null;
                                                                        })}
                                                                    selectedTeam={selectedTeam}
                                                                    setSelectedTeam={setSelectedTeam}
                                                                    setTeamPlayers={setTeamPlayers}
                                                                    allPlayingPlayers={allPlayingPlayers}
                                                                    setAllPlayingPlayers={setAllPlayingPlayers}
                                                                />
                                                            )}
                                                    </div>
                                                )}
                                        </>
                                    )}
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </>
                    )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * @param {{
 * players: Tourney.Player[];
 * selectedTeam: Tourney.Team;
 * setTeamPlayers: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.TeamXPlayer[]>>>
 * setAllPlayingPlayers: React.Dispatch<React.SetStateAction<LoadedData<Record<string,  {name: string; id: string}>>>>;
 * }} param0
 */
function AssignedPlayerList({
    players,
    selectedTeam,
    setTeamPlayers,
    setAllPlayingPlayers,
}) {
    return (
        <div className="divide-y">
            {players.map((player) => (
                <AssignedPlayerListItem
                    key={"player-" + player._id}
                    player={player}
                    selectedTeam={selectedTeam}
                    setTeamPlayers={setTeamPlayers}
                    setAllPlayingPlayers={setAllPlayingPlayers}
                />
            ))}
        </div>
    );
}

/**
 * @param {{
 * player: Tourney.Player
 * selectedTeam: Tourney.Team;
 * setTeamPlayers: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.TeamXPlayer[]>>>
 * setAllPlayingPlayers: React.Dispatch<React.SetStateAction<LoadedData<Record<string,  {name: string; id: string}>>>>;
 * }} param0
 */
function AssignedPlayerListItem({
    player,
    selectedTeam,
    setTeamPlayers,
    setAllPlayingPlayers,
}) {
    const { api } = useAuth();

    let [working, setWorking] = useState(false);

    /** @param {Tourney.Player} player */
    function removePlayer(player) {
        if (selectedTeam == null) return;

        setWorking(true);

        api.post(`player/${player._id}/remove`).then(() => {
            setTeamPlayers((v) => {
                if (v.state !== "resolved") return v;
                return {
                    state: "resolved",
                    data: v.data.filter((p) => p.playerId !== player._id),
                };
            });
            setAllPlayingPlayers((v) => {
                if (v.state !== "resolved") return v;
                delete v.data[player._id];
                return v;
            });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then(({ message }) => toast.error(message));
            } else {
                toast.error("Something went wrong!");
            }
        }).finally(() => setWorking(false));
    }
    return (
        <div className="px-4 py-2 flex justify-between gap-4 place-items-center">
            <div>{player.name}</div>
            <Button
                disabled={working}
                variant="ghost"
                size="icon"
                onClick={() => {
                    if (working) return;
                    removePlayer(player);
                }}
            >
                {working ? <LoaderCircleIcon className="animate-spin" /> : <MinusIcon />}
            </Button>
        </div>
    );
}

/**
 * @param {{
 * players: Tourney.Player[];
 * selectedTeam: Tourney.Team;
 * setSelectedTeam: React.Dispatch<React.SetStateAction<Tourney.Team>>;
 * setTeamPlayers: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.TeamXPlayer[]>>>;
 * allPlayingPlayers: LoadedData<Record<string,  {name: string; id: string}>>;
 * setAllPlayingPlayers: React.Dispatch<React.SetStateAction<LoadedData<Record<string,  {name: string; id: string}>>>>;
 * }} param0
 */
function UnassignedPlayerList({
    players,
    selectedTeam,
    setSelectedTeam,
    setTeamPlayers,
    allPlayingPlayers,
    setAllPlayingPlayers,
}) {
    return (
        <div className="divide-y">
            {players.map((player) => (
                <UnassignedPlayerListItem
                    key={"player-" + player._id}
                    player={player}
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    setTeamPlayers={setTeamPlayers}
                    allPlayingPlayers={allPlayingPlayers}
                    setAllPlayingPlayers={setAllPlayingPlayers}
                />
            ))}
        </div>
    );
}

/**
 * @param {{
 * player: Tourney.Player
 * selectedTeam: Tourney.Team;
 * setSelectedTeam: React.Dispatch<React.SetStateAction<Tourney.Team>>;
 * setTeamPlayers: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.TeamXPlayer[]>>>
 * allPlayingPlayers: LoadedData<Record<string, {name: string; id: string}>>;
 * setAllPlayingPlayers: React.Dispatch<React.SetStateAction<LoadedData<Record<string, {name: string; id: string}>>>>;
 * }} param0
 */
function UnassignedPlayerListItem({
    player,
    selectedTeam,
    setSelectedTeam,
    setTeamPlayers,
    allPlayingPlayers,
    setAllPlayingPlayers,
}) {
    const { api } = useAuth();
    const { tournament } = useContext(TournamentContext);

    let [working, setWorking] = useState(false);

    /** @param {Tourney.Player} player */
    function assignPlayer(player) {
        if (selectedTeam == null) return;

        const team = { ...selectedTeam };

        setWorking(true);

        api.post(`player/${player._id}/assign`, {
            json: { teamId: team._id },
        }).then(() => {
            setTeamPlayers((v) => {
                if (v.state !== "resolved") return v;
                return {
                    state: "resolved",
                    data: [...v.data, {
                        _id: "",
                        playerId: player._id,
                        teamId: team._id,
                    }],
                };
            });
            setAllPlayingPlayers((v) => {
                if (v.state !== "resolved") return v;
                return { ...v, [player._id]: { id: team._id, name: team.name } };
            });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then(({ message }) => toast.error(message));
            } else {
                toast.error("Something went wrong!");
            }
        }).finally(() => setWorking(false));
    }

    return (
        <div className="px-4 py-2 flex justify-between gap-4 place-items-center">
            <div>
                <div>{player.name}</div>
                <div className="text-muted-foreground text-xs">
                    {allPlayingPlayers.state === "pending"
                        ? <span>loading status...</span>
                        : allPlayingPlayers.state === "rejected"
                        ? <span className="text-destructive">failed to load status</span>
                        : allPlayingPlayers.data[player._id] != null
                        ? (
                            <span className="text-yellow-400 truncate">
                                member of{" "}
                                <button
                                    className="underline cursor-pointer"
                                    onClick={() => {
                                        const assignedTeam = allPlayingPlayers.data[player._id];
                                        setSelectedTeam({
                                            _id: assignedTeam.id,
                                            name: assignedTeam.name,
                                            tournamentId: tournament.id,
                                            teamStats: null, // todo: ?
                                        });
                                    }}
                                >
                                    {allPlayingPlayers.data[player._id].name}
                                </button>
                            </span>
                        )
                        : <span className="text-primary">available to assign</span>}
                </div>
            </div>
            <Button
                disabled={working}
                variant="ghost"
                size="icon"
                onClick={() => {
                    if (working) return;
                    assignPlayer(player);
                }}
            >
                {working ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
            </Button>
        </div>
    );
}
