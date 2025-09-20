import { useContext, useState } from "react";
import AuthContext from "../AuthContext.jsx";
import "./components.css";
import { Navigate } from "react-router-dom";

const Signup = () => {
    const { signup } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        const result = await signup(formData.username, formData.email, formData.password);
        setSuccess(result);
        if (result) setLoading(true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input className="m-1 p-2 backdrop-contrast-50" type="text" name="username" placeholder="Username" onChange={handleChange} value={formData.username} required />
            <input className="m-1 p-2 backdrop-contrast-50" type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
            <input className="m-1 p-2 backdrop-contrast-50" type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
            <button className="m-1 p-2 backdrop-contrast-50 cursor-pointer" type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
            {success === false && <p style={{ color: "red" }}>SignUp failed...</p>}
            {success === true && (
                <>
                    <p style={{ color: "green" }}>Account created successfully!</p>
                    <Navigate to="/profile" />
                </>
            )}

        </form>
    );
};

export default Signup;
