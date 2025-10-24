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
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { CircleXIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { TournamentContext } from "./tournament-context";

export function StagesSection() {
    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between place-items-center gap-4">
                <h3 className="font-medium text-xl">Stages</h3>
                <div>
                    <CreateStageFormDialog />
                </div>
            </div>

            <StagesTable />
        </div>
    );
}

const CREATE_STAGE_SCHEMA = z.object({
    name: z.string().min(3),
    type: z.enum(["league", "group", "knockout"]).default("league"),
});

const STAGE_TYPE_OPTIONS = [
    {
        type: "league",
        name: "League Stage",
        description: "Every team plays against all other teams, and rankings are based on total points.",
        disabled: false,
    },
    {
        type: "group",
        name: "Group Stage",
        description: "Teams are divided into groups, playing within their group to qualify for the next round.",
        disabled: false,
    },
    {
        type: "knockout",
        name: "Knockout Stage",
        description: "Teams compete in elimination matches where the loser is immediately removed from the tournament.",
        disabled: false,
    },
];

function CreateStageFormDialog() {
    const { api } = useAuth();
    const {
        tournament,
        setStages,
    } = useContext(TournamentContext);

    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm({
        resolver: zodResolver(CREATE_STAGE_SCHEMA),
        defaultValues: {
            name: "",
            type: "league",
        },
    });

    /** @param {z.infer<typeof CREATE_STAGE_SCHEMA>} values */
    function onSubmit(values) {
        if (isCreating) return;
        setIsCreating(true);

        api.post(`stages/${tournament.data._id}/create`, {
            json: {
                name: values.name,
                type: values.type,
            },
        }).json().then((stage) => {
            toast.success("Done!");
            setStages((v) => {
                if (v.state !== "resolved") return v;
                return {
                    state: "resolved",
                    data: [...v.data, {
                        _id: stage.stageId,
                        name: values.name,
                        order: stage.order,
                        tournamentId: tournament.data._id,
                        type: values.type,
                    }],
                };
            });
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
                    <PlusIcon /> Create Stage
                </Button>
            </DialogTrigger>
            <Form {...form}>
                <form>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Stage</DialogTitle>
                            <DialogDescription>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <FieldGroup>
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="stage-name-input">
                                                Stage name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="stage-name-input"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="First Stage"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="type"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FieldSet data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="stage-type">
                                                Stage Type
                                            </FieldLabel>
                                            <RadioGroup
                                                defaultValue="league"
                                                name={field.name}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                aria-invalid={fieldState.invalid}
                                            >
                                                {STAGE_TYPE_OPTIONS.map((option) => (
                                                    <FieldLabel
                                                        key={option.type}
                                                        htmlFor={`stage-type-${option.type}`}
                                                    >
                                                        <Field
                                                            orientation="horizontal"
                                                            data-invalid={fieldState.invalid}
                                                        >
                                                            <FieldContent>
                                                                <FieldTitle>{option.name}</FieldTitle>
                                                                <FieldDescription>
                                                                    {option.description}
                                                                </FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem
                                                                value={option.type}
                                                                id={`stage-type-${option.type}`}
                                                                aria-invalid={fieldState.invalid}
                                                                disabled={option.disabled}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                ))}
                                            </RadioGroup>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </FieldSet>
                                    )}
                                />
                            </FieldGroup>
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

function StagesTable() {
    const { api } = useAuth();
    const {
        tournament,
        stages,
        setStages,
    } = useContext(TournamentContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (tournament.state !== "resolved") return;

        setStages({ state: "pending", message: "Fetching stages" });

        api.get(`tournaments/${tournament.data._id}/stages`).json()
            .then((stages) => {
                setStages({ state: "resolved", data: stages });
            })
            .catch((error) => {
                if (error instanceof HTTPError && error.response) {
                    error.response.json()
                        .then(({ message }) => toast.error(message));
                }
                setStages({ state: "rejected", message: "Failed to fetch stages" });
            });
    }, [tournament]);

    const [filterString, setFilterString] = useState("");

    if (stages.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (stages.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {stages.message}
            </div>
        );
    }

    if (stages.data.length === 0) {
        return (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                No stages have been created.
            </div>
        );
    } else {
        return (
            <>
                <SearchInput placeholder="Find stages..." query={filterString} setQuery={setFilterString} />

                <div className="border rounded-sm divide-y">
                    {stages.data
                        .filter((stage) => stage.name.toLowerCase().includes(filterString.toLowerCase()))
                        .toSorted((a, b) => a.order - b.order)
                        .map((stage, i) => (
                            <div
                                key={`stage-${stage._id}`}
                                className="flex gap-4 px-6 py-4 cursor-pointer hover:bg-muted duration-150 first:rounded-t-sm last:rounded-b-sm"
                                onClick={() => {
                                    navigate(`stages/${stage._id}`);
                                }}
                            >
                                <div className="text-2xl">{stage.order.toString().padStart(2, "0")}</div>
                                <div>
                                    <div>{stage.name}</div>
                                    <div className="text-muted-foreground text-sm capitalize">{stage.type}</div>
                                </div>
                            </div>
                        ))}
                </div>
            </>
        );
    }
}
