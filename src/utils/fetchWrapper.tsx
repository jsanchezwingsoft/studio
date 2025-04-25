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
            const refreshResponse = await fetch('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/refresh', { 
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

    const response = await fetch(url, options);

    if (response.status === 404) {
        return { error: 'not_found', status: 404, message: `Endpoint not found: ${url}` };
    }

    return response;
};