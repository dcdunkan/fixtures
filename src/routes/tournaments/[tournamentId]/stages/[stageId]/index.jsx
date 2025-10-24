import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { HTTPError } from "ky";
import { CalendarDaysIcon, CircleXIcon, LoaderIcon } from "lucide-react";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { StageContext } from "./stage-context";
import StageItemsSection from "./StageItemsSection";

export default function StagePage() {
    /** @type {Readonly<import("react-router").Params<"tournamentId" | "stageId">>} */
    const params = useParams();
    const { api } = useAuth();
    const navigate = useNavigate();

    const [stage, setStage] = useState(
        /** @type {LoadedData<Tourney.Stage & {roundsCount: number}>} */ ({
            state: "pending",
            message: "Fetching stage",
        }),
    );

    const [stageItems, setStageItems] = useState(
        /** @type {StageContext["stageItems"]} */ ({
            state: "pending",
            message: "Fetching stage items",
        }),
    );

    useEffect(() => {
        setStage({ state: "pending", message: "Fetching stage" });

        api.get(`stages/${params.stageId}`).json().then((stage) => {
            setStage({ state: "resolved", data: stage });
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json().then(({ message }) => toast.error(message));
            }
            setStage({ state: "rejected", message: "Failed to fetch stage" });
        });
    }, [params]);

    const [generating, setGenerating] = useState(false);
    function generateSchedule() {
        if (stage.state !== "resolved" || generating) return;
        setGenerating(true);

        api.post(`rounds/${stage.data._id}`).json().then((generated) => {
            setStage((v) => {
                if (v.state !== "resolved") return v;
                return {
                    state: "resolved",
                    data: {
                        ...v.data,
                        roundsCount: generated.rounds.length,
                    },
                };
            });
            // navigate(`schedule/${}`);
        }).catch((error) => {
            if (error instanceof HTTPError && error.response) {
                error.response.json().then(({ message }) => toast.error(message));
                return;
            }
            toast.error("Something went wrong");
        }).finally(() => setGenerating(false));
    }

    if (stage.state === "pending") {
        return (
            <div className="flex items-center justify-center gap-2">
                <LoaderIcon className="animate-spin size-5" />
            </div>
        );
    } else if (stage.state === "rejected") {
        return (
            <div className="flex items-center justify-center gap-2">
                <CircleXIcon className="size-5" /> {stage.message}
            </div>
        );
    }

    return (
        <StageContext.Provider
            value={{
                stage: stage,
                setStage: setStage,
                stageItems: stageItems,
                setStageItems: setStageItems,
            }}
        >
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between place-items-center gap-2">
                        <div className="">
                            <h2 className="font-semibold text-2xl">{stage.data.name}</h2>
                            <div className="text-muted-foreground">
                                Stage {stage.data.order} &middot; <span className="capitalize">{stage.data.type}</span>
                            </div>
                        </div>

                        <div>
                            <Button
                                disabled={generating}
                                onClick={() => {
                                    if (stage.data.roundsCount === 0) {
                                        generateSchedule();
                                    } else {
                                        navigate(`schedule`);
                                    }
                                }}
                            >
                                {generating
                                    ? (
                                        <>
                                            <LoaderCircleIcon className="animate-spin" /> Generating
                                        </>
                                    )
                                    : (
                                        <>
                                            <CalendarDaysIcon /> {stage.data.roundsCount === 0
                                                ? <span>Generate Schedule</span>
                                                : <span>View Schedule</span>}
                                        </>
                                    )}
                            </Button>
                        </div>
                    </div>
                </div>

                <StageItemsSection />

                {/* <JSONPreview data={stage.data} /> */}
            </div>
        </StageContext.Provider>
    );
}
