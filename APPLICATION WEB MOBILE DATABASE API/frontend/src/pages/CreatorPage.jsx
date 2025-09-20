import React, { useEffect, useState, useContext } from "react";
import BottomNav from "../components/BottomNav.jsx";
import "./pages.css";
import TemplateCreationForm from "../components/TemplateCreationForm.jsx";
import request from "../components/API.js";
import AuthContext from "../AuthContext.jsx";

export default function CreatorPage() {
    const { user, loading } = useContext(AuthContext);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (loading) return;

        if (!user) {
            setError("You must be logged in to access this page.");
            return;
        }

        const fetchTemplates = async () => {
            try {
                const data = await request("templates");
                setTemplates(data.templates || []);
                console.log("Templates fetched:", data.templates);
            } catch (err) {
                console.error("Error fetching templates:", err);
            }
        };
        fetchTemplates();
    }, [user, loading]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
    };

    return (
        <div className="app-container">
            <header>
                <img src="/logo.svg" alt="Logo" style={{ height: "60px", width: "auto" }} />
            </header>

            <div className="creator-container">
                {error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : !selectedTemplate ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Choose a Template</h2>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="bg-white bg-opacity-10 hover:bg-opacity-20 text-black font-semibold py-4 px-2 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-md transition duration-200 transform hover:scale-105 flex flex-col items-center text-center"
                                >
                                    <span className="text-lg font-bold">{template.name}</span>
                                    <span className="text-sm opacity-70">{template.description}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <TemplateCreationForm template={selectedTemplate} />
                )}
            </div>

            <BottomNav />
        </div>
    );

}
