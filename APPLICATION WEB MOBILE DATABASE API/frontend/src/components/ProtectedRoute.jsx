import { useContext, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext.jsx";

const ProtectedRoute = () => {
    const {loggedIn, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedIn) {
            navigate("/profile");
        }
    }, [loggedIn, navigate]);

    // If the user is authenticated, render the child components (Outlet (Profile Page))
    // Otherwise, redirect the user to the auth page
    if (loading) return null;

    return loggedIn ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;
