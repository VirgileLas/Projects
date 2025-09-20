import config from '../config.json';

const API_URL = config.API_URL;

const request = async (endpoint, options = {}) => {
    const fullUrl = API_URL + endpoint;

    let { body } = options;
    let headers = options.headers || {};

    // Si c’est un objet JS pur (pas string ni FormData), stringify et ajoute Content-Type
    if (body && typeof body === "object" && !(body instanceof FormData)) {
        body = JSON.stringify(body);
        headers = {
            "Content-Type": "application/json",
            ...headers,
        };
    }

    // Si c’est déjà une string (par exemple tu as JSON.stringify dans le login), ajoute juste Content-Type
    if (typeof body === "string" && !headers["Content-Type"]) {
        headers = {
            "Content-Type": "application/json",
            ...headers,
        };
    }

    // Si c’est FormData, ne rien toucher (pas de Content-Type ici)
    if (body instanceof FormData) {
        // on enlève Content-Type car le navigateur gère les boundaries
        if (headers["Content-Type"]) {
            delete headers["Content-Type"];
        }
    }

    try {
        const res = await fetch(fullUrl, {
            credentials: "include",
            ...options,
            body,
            headers,
        });

        const data = await res.json();

        console.log("API request done (api.js):", data);
        if (!data.success) {
            console.error("But the API request didn't succeed (api.js):", data.message);
        }

        return data;
    } catch (error) {
        console.error("API request failed (api.js):", error);
        return { success: false, message: "An error occurred. Please try again later." };
    }
};

export default request;
