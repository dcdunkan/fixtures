import { createContext, useContext } from "react";

// todo: get rid of this
/** @type {GlobalStateContext} */
export const GlobalStateContext = createContext(undefined);

/** @returns {GlobalStateContext} */
export function useGlobalState() {
    return useContext(GlobalStateContext);
}
