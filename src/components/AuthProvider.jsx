import { AuthContext } from "@/hooks/auth";
import { ACCESS_TOKEN_LOCAL_STORAGE } from "@/lib/constants";
import ky, { HTTPError } from "ky";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

export function AuthProvider({ children }) {
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
            hooks: {
                beforeRequest: [
                    (request) => {
                        const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);
                        if (accessToken != null) {
                            request.headers.set("Authorization", `Bearer ${accessToken}`);
                        }
                    },
                ],
                afterResponse: [
                    async (request, options, response) => {
                        if (response.status === 401) {
                            try {
                                const { accessToken, user } = await ky
                                    .get(`${import.meta.env.VITE_BACKEND_URL}/user/refresh`, { credentials: "include" })
                                    .json();

                                setData(user);

                                localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE, accessToken);
                                request.headers.set("Authorization", `Bearer ${accessToken}`);
                                return ky(request);
                            } catch (err) {
                                console.warn("should logout");
                            }
                        }
                    },
                ],
            },
        }), []);

    useEffect(() => {
        if (PUBLIC_ROUTES.includes(location.pathname)) {
            setLoading(false);
        } else {
            setLoading(true);

            api.get("user/me")
                .json()
                .then((data) => {
                    setData(data);
                })
                .catch((error) => {
                    console.error(error);
                    console.log("should redirect to login");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);

        if (PUBLIC_ROUTES.includes(location.pathname)) {
            if (accessToken != null) {
                window.location.href = "/";
            }
        } else {
            if (accessToken == null) {
                window.location.href = "/login";
            }
        }
    }, [location.pathname, loading]);

    if (loading) return null; // todo: a spinner

    return (
        <AuthContext.Provider value={{ api, data, setData }}>
            {children}
        </AuthContext.Provider>
    );
}
