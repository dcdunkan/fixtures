import { createContext, useContext } from "react";

/** @type {AuthContext} */
export const AuthContext = createContext(undefined);

/** @returns {AuthContext} */
export function useAuth() {
    return useContext(AuthContext);
}
