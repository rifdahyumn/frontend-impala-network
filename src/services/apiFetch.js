export const apiFetch = async (url, options = {}, logout, navigate) => {

    const token = localStorage.getItem("access_token");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("access_token");
        logout();
        navigate("/login");
        throw new Error("Session expired");
    }

    return response;
};