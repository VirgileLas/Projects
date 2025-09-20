import { useContext, useState } from "react";
import Login from "../components/Login.jsx";
import Signup from "../components/Signup.jsx";
import BottomNav from "../components/BottomNav.jsx";
import "./pages.css";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup

    return (
        <div className="app-container">
            <header>
                <img src="/logo.svg" alt="Logo" style={{ height: "60px", width: "auto", background: "transparent" }} />
            </header>
            <div className="auth-container">
                <h2 className="font-anton text-4xl m-3 tracking-wide uppercase">{isLogin ? "Login" : "Sign Up"}</h2>
                {isLogin ? <Login /> : <Signup />} {/* Display the Login or Signup component */}

                <p>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button className="text-blue-500 font-extrabold cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
            <BottomNav />
        </div>
    );
};

export default AuthPage;

