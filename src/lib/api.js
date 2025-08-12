import ky from "ky";

export const api = ky.create({
    prefixUrl: import.meta.env.VITE_BACKEND_URL,
    headers: {
        Accept: "application/json",
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
                        const { accessToken } = await api.get("user/refresh").json();
                        request.headers.set("Authorization", `Bearer ${newToken}`);
                        return ky(request);
                    } catch {
                        window.location.href = "/login";
                    }
                }
            },
        ],
    },
});
