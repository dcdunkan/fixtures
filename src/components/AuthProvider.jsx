import ky, { HTTPError } from "ky";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();

    const PUBLIC_ROUTES = ["/login", "/register"];
    const api = useMemo(() =>
        ky.create({
            prefixUrl: import.meta.env.VITE_BACKEND_URL,
            headers: {
                // Accept: "application/json",
                "Content-Type": "application/json",
            },
            credentials: "include",
            hooks: {
                beforeRequest: [
                    (request) => {
                        if (accessToken) {
                            request.headers.set("Authorization", `Bearer ${accessToken}`);
                        }
                    },
                ],
                afterResponse: [
                    async (request, options, response) => {
                        if (response.status === 401) {
                            try {
                                const { accessToken: newToken, user } = await ky
                                    .get(`${import.meta.env.VITE_BACKEND_URL}/user/refresh`, { credentials: "include" })
                                    .json();
                                setAccessToken(newToken);
                                setData(user);
                                request.headers.set("Authorization", `Bearer ${newToken}`);
                                return ky(request);
                            } catch (err) {
                                // if (window.location.href != "/login") {
                                //     window.location.href = "/login";
                                // }
                            }
                        }
                    },
                ],
            },
        }), []);

    useEffect(() => {
        (async () => {
            try {
                const { accessToken: newToken, user } = await ky
                    .get(`${import.meta.env.VITE_BACKEND_URL}/user/refresh`, { credentials: "include" })
                    .json();
                setAccessToken(newToken);
                setData(user);
            } catch (err) {
                if (err instanceof HTTPError && err.response.status === 401) {
                    // window.location.href = "/login";
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (PUBLIC_ROUTES.includes(location.pathname)) {
            if (accessToken != null) {
                window.location.href = "/";
            }
        } else {
            if (accessToken == null) {
                window.location.href = "/login";
            }
        }
    }, [location.pathname, accessToken, loading]);

    if (loading) return null; // todo: a spinner

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, api, data, setData }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
