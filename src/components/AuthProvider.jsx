import { AuthContext } from "@/hooks/auth";
import { ACCESS_TOKEN_LOCAL_STORAGE } from "@/lib/constants";
import ky from "ky";
import { useEffect, useMemo, useState } from "react";

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);

    /** @type {ReturnType<typeof useState<AuthData>>} */
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
                        // todo: only do if request is to a protected route
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
        const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);

        if (PUBLIC_ROUTES.includes(window.location.pathname)) {
            setLoading(false);

            if (accessToken != null) {
                window.location.href = "/";
            }
        } else {
            if (accessToken == null) {
                window.location.href = "/login";
                // navigate("/", {})
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
        }
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center place-items-center">
                Authenticating
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ api, data, setData }}>
            {children}
        </AuthContext.Provider>
    );
}
