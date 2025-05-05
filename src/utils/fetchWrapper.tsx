import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

export const isAuthenticated = (accessToken: string | null): boolean => {
    if (!accessToken) {
        return false;
    }
    try {
        const decodedToken: DecodedToken = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const tenMinutesInSeconds = 10 * 60;
        return decodedToken.exp - currentTime > tenMinutesInSeconds;
    } catch (error) {
        console.error("Error decoding token:", error);
        return false;
    }
};

export const fetchWrapper = async (
    url: string,
    options: RequestInit = {}
) => {
    let accessToken = sessionStorage.getItem('accessToken');
    let refreshToken = sessionStorage.getItem('refreshToken');
    if (!isAuthenticated(accessToken)) {
        if (!refreshToken) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            return { error: 'not_authenticated' };
        }
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
            if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API_URL is not set");
            const refreshUrl = `${baseUrl}/v1/auth/refresh`;
            const refreshResponse = await fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!refreshResponse.ok) {
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                return { error: 'not_authenticated' };
            }
            const { access_token } = await refreshResponse.json();
            accessToken = access_token;
            sessionStorage.setItem("accessToken", access_token);
        } catch (error) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            return { error: 'not_authenticated' };
        }
    }
    if (!options.headers) {
        options.headers = {};
    }
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    // CORRECCIÓN: Serializa el body si es un objeto (no string)
    if (options.body && typeof options.body !== 'string') {
        options.body = JSON.stringify(options.body);
        // Asegura que el header Content-Type esté presente
        (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, options);
    if (response.status === 404) {
        return { error: 'not_found', status: 404, message: `Endpoint not found: ${url}` };
    }
    return response;
};