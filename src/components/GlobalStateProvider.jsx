import { GlobalStateContext } from "@/hooks/global-state";
import { useState } from "react";

export function GlobalStateProvider({ children }) {
    /** @type {ReturnType<typeof useState<LoadedData<Tourney.Club[]>>>} */
    const [clubs, setClubs] = useState({
        state: "pending",
        message: "Retrieving clubs",
    });

    return (
        <GlobalStateContext.Provider
            value={/** @type {GlobalStateContext} */ ({
                clubs,
                setClubs,
            })}
        >
            {children}
        </GlobalStateContext.Provider>
    );
}
