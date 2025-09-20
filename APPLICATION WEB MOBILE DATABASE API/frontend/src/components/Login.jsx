import { useContext, useState } from "react";
import AuthContext from "../AuthContext.jsx";
import "./components.css";
import { Navigate } from "react-router-dom";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        const result = await login(formData.username, formData.password);
        setSuccess(result);
        if (result) setLoading(true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input className="m-1 p-2 backdrop-contrast-50" type="text" name="username" placeholder="Username" onChange={handleChange} required />
            <input className="m-1 p-2 backdrop-contrast-50" type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button className="m-1 p-2 backdrop-contrast-50 cursor-pointer" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            {success === false && <p style={{ color: "red" }}>Login failed...</p>}
            {success === true && (
                <>
                    <p style={{ color: "green" }}>Login successful!</p>
                    <Navigate to="/profile" />
                </>
            )}

        </form>
    );
};

export default Login;
