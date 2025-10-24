import { JSONPreview } from "@/components/JSONPreview";
import { Minidenticon } from "@/components/Minidenticon";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { HTTPError } from "ky";
import { MinusIcon } from "lucide-react";
import { TableIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";
import { CircleXIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { toast } from "sonner";
import z from "zod";

export default function SchedulePage() {
    const { api } = useAuth();
    const navigate = useNavigate();
    /** @type {Readonly<import("react-router").Params<"tournamentId" | "stageId">>} */
    const params = useParams();

    const [stageItems, setStageItems] = useState(
        /** @type {LoadedData<(Omit<Tourney.StageItem, "inputs"> & {inputs: Tourney.Team[];roundsCount: number;})[]>} */ ({
            state: "pending",
            message: "Fetching stage items",
        }),
    );

    function fetchStageItems() {
        setStageItems({ state: "pending", message: "Fetching stage items" });

        api.get(`stages/${params.stageId}/items`).json().then((items) => {
            setStageItems({ state: "resolved", data: items });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json().then(({ message }) => toast.error(message));
            }
            setStageItems({ state: "rejected", message: "Failed to fetch stage items" });
        });
    }
    useEffect(() => {
        fetchStageItems();
    }, [params]);

    if (stageItems.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (stageItems.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {stageItems.message}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between place-items-center gap-2">
                    <div className="">
                        <h2 className="font-semibold text-2xl">Schedule</h2>
                        <div className="text-muted-foreground">
                            {stageItems.data.reduce((p, c) => p + c.roundsCount, 0)} rounds
                        </div>
                    </div>
                    <div>
                        <Button
                            onClick={() => {
                                navigate("..");
                            }}
                        >
                            <TableIcon /> View Standings
                        </Button>
                    </div>
                </div>
            </div>

            {stageItems.data.length === 0
                ? (
                    <div className="flex items-center justify-center gap-2">
                        No stage items created yet.
                    </div>
                )
                : stageItems.data.map((item) => (
                    <StageItemRoundsSection
                        key={item._id}
                        stageItem={item}
                    />
                ))}
        </div>
    );
}

/**
 * @param {{stageItem:Omit<Tourney.StageItem, "inputs"> & {inputs: Tourney.Team[];roundsCount: number;} }} param0
 */
export function StageItemRoundsSection({ stageItem }) {
    const { api } = useAuth();

    const [rounds, setRounds] = useState(
        /** @type {LoadedData<(Tourney.Round & {matches: Tourney.Match[]})[]>} */ ({
            state: "pending",
            message: "Fetching rounds",
        }),
    );
    function fetchStageItemRounds() {
        setRounds({ state: "pending", message: "Fetching rounds" });

        api.get(`stages/${stageItem.stageId}/rounds`).json().then((rounds) => { /// todo: need to be changed to stageItemId
            setRounds({ state: "resolved", data: rounds });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json().then(({ message }) => toast.error(message));
            }
            setRounds({ state: "rejected", message: "Failed to fetch rounds" });
        });
    }

    const [teams, setTeams] = useState(
        /** @type {LoadedData<Record<string, Tourney.Team>>} */ ({
            state: "pending",
            message: "Fetching teams",
        }),
    );
    function fetchStageItemTeams() {
        setTeams({ state: "pending", message: "Fetching teams" });

        api.get(`stageItem/${stageItem._id}/teams`).json().then((teams) => {
            setTeams({
                state: "resolved",
                data: teams.reduce((p, team) => {
                    return { ...p, [team._id]: team };
                }, {}),
            });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json().then(({ message }) => toast.error(message));
            }
            setTeams({ state: "rejected", message: "Failed to fetch teams" });
        });
    }

    useEffect(() => {
        Promise.all([
            fetchStageItemRounds(),
            fetchStageItemTeams(),
        ]);
    }, [stageItem]);

    if (rounds.state === "pending" || teams.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (rounds.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {rounds.message}
            </div>
        );
    } else if (teams.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {teams.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {rounds.data.map((round) => (
                <RoundSection
                    key={round._id}
                    round={round}
                    teams={teams.data}
                    setRounds={setRounds}
                />
            ))}
        </div>
    );
}

/**
 * @param {{
 * round: Tourney.Round & {matches: Tourney.Match[]};
 * teams: Record<string, Tourney.Team>
 * setRounds: React.Dispatch<React.SetStateAction<LoadedData<(Tourney.Round & {matches: Tourney.Match[]})[]>>>
 * }} param0
 */
function RoundSection({ round, teams, setRounds }) {
    const [selectedMatch, setSelectedMatch] = useState(/** @type {Tourney.Match | null} */ (null));

    return (
        <div className="space-y-2">
            <div className="font-medium">Round {round.number}</div>
            <div className="divide-y border rounded-sm">
                {round.matches.map((match) => {
                    /** @param {{teamId: string | undefined, score: number | undefined}} param0 */
                    function Team({ teamId, score }) {
                        const otherTeamScore = match.participant1 != null && match.participant1 === teamId
                            ? match.score.team2Score
                            : match.score.team1Score;
                        return (
                            <div
                                className={clsx("flex place-items-center gap-4 justify-between", {
                                    "text-muted-foreground": match.startTime != null && score <= otherTeamScore,
                                })}
                            >
                                {teamId
                                    ? (
                                        <div className="flex gap-2 place-items-center">
                                            <Minidenticon value={teamId} /> {teams?.[teamId]?.name}
                                        </div>
                                    )
                                    : <div className="text-muted-foreground">&mdash;</div>}
                                <div>
                                    <div className="aspect-square min-w-6 flex items-center justify-center">
                                        {match.endTime == null && match.startTime == null
                                            ? <div className="text-muted-foreground">&mdash;</div>
                                            : score}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={match._id}
                            className="p-2 hover:bg-muted duration-100 text-sm cursor-pointer select-none first:rounded-t-sm last:rounded-b-sm"
                            onClick={() => {
                                if (selectedMatch != null) return;
                                setSelectedMatch(match);
                            }}
                        >
                            <Team teamId={match.participant1} score={match.score.team1Score} />
                            <Team teamId={match.participant2} score={match.score.team2Score} />
                        </div>
                    );
                })}
            </div>

            <MatchDialog
                teams={teams}
                round={round}
                match={selectedMatch}
                setSelectedMatch={setSelectedMatch}
                setRounds={setRounds}
            />
        </div>
    );
}

const updateSchema = z.object({
    team1Score: z.number().min(0),
    team2Score: z.number().min(0),
});

/**
 * @param {{
 * setRounds: React.Dispatch<React.SetStateAction<LoadedData<(Tourney.Round & {matches: Tourney.Match[]})[]>>>
 * match: Tourney.Match; round: Tourney.Round; teams: Record<string, Tourney.Team> }} param0
 * @returns
 */
function MatchDialog({ setRounds, match, round, teams, setSelectedMatch }) {
    // if (teams[match.participant1] == null || teams[match.participant2] == null) {
    //     return <div>Todo</div>
    // }

    return (
        <Dialog
            open={match != null}
            onOpenChange={(isOpening) => {
                // form.
                if (!isOpening) {
                    setSelectedMatch(null);
                }
            }}
        >
            {match != null
                && (
                    <MatchDialogContent
                        setRounds={setRounds}
                        match={match}
                        round={round}
                        teams={teams}
                        setSelectedMatch={setSelectedMatch}
                    />
                )}
        </Dialog>
    );
}

/**
 * @param {{field: { onChange: (value: number) => void; value: number } }} param0
 */
function CounterFormField({ field }) {
    return (
        <div className="flex place-items-center justify-evenly gap-3">
            <Button
                variant="ghost"
                size="icon"
                disabled={field.value <= 0}
                onClick={() => {
                    if (field.value > 0) {
                        field.onChange(field.value - 1);
                    }
                }}
            >
                <MinusIcon />
            </Button>
            <span>{field.value}</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    field.onChange(field.value + 1);
                }}
            >
                <PlusIcon />
            </Button>
        </div>
    );
}

/**
 * @param {{
 * setRounds: React.Dispatch<React.SetStateAction<LoadedData<(Tourney.Round & {matches: Tourney.Match[]})[]>>>
 * match: Tourney.Match; round: Tourney.Round; teams: Record<string, Tourney.Team> }} param0
 * @returns
 */
function MatchDialogContent({ setRounds, match, round, teams, setSelectedMatch }) {
    const { api } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [ending, setEnding] = useState(false);

    const form = useForm({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            team1Score: match.score.team1Score ?? 0,
            team2Score: match.score.team2Score ?? 0,
        },
    });

    /** @param {z.infer<typeof updateSchema>} values */
    function onSubmitUpdate(values) {
        if (match == null) return;
        if (updating) return;
        setUpdating(true);

        const { match: selectedMatch } = { match };

        api.patch(`match/${match._id}`, {
            json: {
                score: {
                    team1: values.team1Score,
                    team2: values.team2Score,
                },
            },
        }).json().then((updatedMatch) => {
            setRounds((rounds) => {
                if (rounds.state !== "resolved") return;
                const updated = [...rounds.data];
                const updatedRound = updated.find((r) => r._id === selectedMatch.roundId);
                const updatedMatchIndex = updatedRound.matches.findIndex((m) => m._id === selectedMatch._id);
                updatedRound.matches.splice(updatedMatchIndex, 1, updatedMatch);
                setSelectedMatch(updatedMatch);
                return { state: "resolved", data: updated };
            });

            // navigate(`/tournaments/${tournament.tournamentId}`);
            toast.success("Done!");
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then((result) => toast.error(result.message));
                return;
            }
            toast.error(error.message);
        }).finally(() => {
            setUpdating(false);
        });
    }

    /** @param {z.infer<typeof updateSchema>} values */
    function onSubmitDelete(values) {
        if (match == null) return;
        if (ending) return;
        setEnding(true);

        const { match: selectedMatch } = { match };

        api.post(`match/${match._id}/end`, {
            json: {
                score: {
                    team1: values.team1Score,
                    team2: values.team2Score,
                },
            },
        }).json().then((updatedMatch) => {
            setRounds((rounds) => {
                if (rounds.state !== "resolved") return;
                const updated = [...rounds.data];
                const updatedRound = updated.find((r) => r._id === selectedMatch.roundId);
                const updatedMatchIndex = updatedRound.matches.findIndex((m) => m._id === selectedMatch._id);
                updatedRound.matches.splice(updatedMatchIndex, 1, updatedMatch);
                setSelectedMatch(updatedMatch);
                return { state: "resolved", data: updated };
            });

            // navigate(`/tournaments/${tournament.tournamentId}`);
            toast.success("Done!");
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json()
                    .then((result) => toast.error(result.message));
                return;
            }
            toast.error(error.message);
        }).finally(() => {
            setEnding(false);
        });
    }

    return (
        <Form {...form}>
            <form>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {teams[match.participant1].name} vs. {teams[match.participant2].name}
                        </DialogTitle>
                        <DialogDescription>Round {round.number}</DialogDescription>
                    </DialogHeader>

                    <div className="w-full">
                        <div className="grid grid-cols-2">
                            <div className="flex flex-col justify-center place-items-center p-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="team1Score"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-full space-y-1 text-2xl place-items-start">
                                            <FormLabel>{teams[match.participant1].name}</FormLabel>
                                            <CounterFormField field={field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col justify-center place-items-center p-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="team2Score"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-full space-y-1 text-2xl place-items-start">
                                            <FormLabel>{teams[match.participant2].name}</FormLabel>
                                            <CounterFormField field={field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        {match.endTime == null && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        await form.trigger();
                                        if (form.formState.isValid) {
                                            await form.handleSubmit(onSubmitDelete)();
                                        }
                                    }}
                                    disabled={updating || ending}
                                >
                                    {updating || ending
                                        ? <LoaderIcon className="animate-spin" />
                                        : "End match"}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        await form.trigger();
                                        if (form.formState.isValid) {
                                            await form.handleSubmit(onSubmitUpdate)();
                                        }
                                    }}
                                    disabled={updating || ending}
                                >
                                    {updating || ending
                                        ? <LoaderIcon className="animate-spin" />
                                        : "Update scores"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Form>
    );
}
