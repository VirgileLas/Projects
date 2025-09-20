import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import request from './components/API.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User state, will be set as { username: "...", email: "...", games_played: int, games_won: int } on login/signup
    const [loading, setLoading] = useState(true); // Loading state, will be set to false after logging in or failing to log in
    const [loggedIn, setLoggedIn] = useState(false); // Track successful login

    useEffect(() => {
        fetchUser();
    }, []); // Fetch the user profile when the component mounts (works only if the user has the cookie)

   useEffect(() => {
        console.log("Saving guesses to the database..."); //debug
        (async () => {
            if (user){
                const cookieKeys = Object.keys(Cookies.get());
                console.log("Cookie keys: ", cookieKeys); //debug
                for (const cookieKey of cookieKeys) {
                    const data = await request("restore/" + cookieKey + "/" + user.username, { method: "GET" });
                    if (data.success) Cookies.remove(cookieKey); // Remove the cookie if the user has played this game before
                    else saveGuessesToDB(cookieKey); // If the user has not played this game before, save the guesses to the database
                }
            }
        })();
    }, [user]); // Save the guesses to the database when the user state changes

    // Function to fetch the user state from the server
    const fetchUser = async () => {
        console.log("Fetching user..."); //debug
        setLoading(true);
        var data = await request ("auth", { method: "GET" });
        if (data.success){
            const username = (data.user.username);
            data = await request ("users/" + username, { method: "GET" });
            if (data.success){
                setUser(data.user);
                setLoggedIn(true);
            }
        }
        setLoading(false);
    };

    // Function to save the guesses from the cookies to the database (in the case of a user logging in after playing)
    const saveGuessesToDB = async (cookieKey) => {
        console.log("Saving guesses from cookies to database... cookieKey:", cookieKey); //debug

        const guesses = JSON.parse(Cookies.get(cookieKey) || "[]"); // Get the guesses from the cookies
        console.log("Guesses to save:", guesses); //debug
        for (let i = 0; i < guesses.length; i++) {
            const data = await request("guess/" + cookieKey + "/" + user.username, { method: "POST", body: JSON.stringify({ guess: guesses[i], guess_number: i + 1 }) });
            if (!data.success) console.log("Failed to save Guesses to database..."); //debug
        }
        Cookies.remove(cookieKey); // Remove the guesses from the cookies
    };

    // Function to login, it sets the user state and saves the guesses from the cookies to the database
    const login = async (username, password) => {
        setLoading(true);
        console.log("Connection attempt...") //debug
        const data = await request("login", { method: "POST", body: JSON.stringify({ username, password }) });
        if (data.success) {
            setUser(data.user); // Set user state
            setLoggedIn(true);
            console.log("Connection successful.") //debug
        }
        else {
            setUser(null); // Set user state to null if login fails
            console.error("Failed to login. Please try again."); //debug
        }
        setLoading(false);
        console.log("User: ", user); //debug
        return data.success;
    };

    const signup = async (username, email, password) => {
        setLoading(true);
        const data = await request("signup", { method: "POST", body: JSON.stringify({ username, email, password }) });
        if (data.success) {
            await fetchUser();
            setLoggedIn(true);
            console.log("Signup successful."); //debug
        }
        else{
            setUser(null); // Set user state to null if signup fails
            console.error("Signup failed. Please try again."); //debug
        }
        setLoading(false);
        return data.success;
    }
    // Function to logout, it sets the user state to null and sends a request to the server to logout (deletes the cookies)
    const logout = async () => {
        const data = await request("logout", { method: "POST" });
        setUser(null);
        setLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, loggedIn, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
