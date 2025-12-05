import React from 'react';
import { FaLinkedin, FaUserTie, FaLaptopCode } from 'react-icons/fa'; // Using different icons

// --- Updated Data ---

const developerInfo = [
    {
        name: "Sunny Radadiya",
        id: "23CE122",
        role: "Frontend Developer",
        linkedin: "https://www.linkedin.com/in/sunny-radadiya/", 
    },
    {
        name: "Aayush Tilva",
        id: "23CE137",
        role: "Backend Developer & DBA",
        linkedin: "https://www.linkedin.com/in/aayush-tilva4/",
    },
    {
        name: "Shreyansh Pipaliya",
        id: "23CE116",
        role: "Frontend Developer", 
        linkedin: "https://www.linkedin.com/in/shreyansh-pipaliya/",
    },
];

const facultyTeam = [
    {
        name: "Prof. Ronak R Patel",
        role: "Project Mentor",
        linkedin: "https://www.linkedin.com/in/ronak-patel-phd/"
    },
    {
        name: "Dr. Jimitkumar R. Patel",
        role: "Project Mentor",
        linkedin: "https://www.linkedin.com/in/jimit-patel-अहम्-पुरुषोत्तम-दासोऽस्मि-77875694/"
    },
];

// --- Component ---

export default function DevelopersPage() {

    // Function to handle opening LinkedIn profiles
    const handleLinkedInClick = (url) => {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-2">Meet the Team</h1>
                    <p className="text-lg text-slate-600">The talented individuals who made this project possible.</p>
                </header>

                {/* Developer Team Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 border-b-2 border-indigo-500 pb-3 text-slate-800">
                        Developer Team
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {developerInfo.map((dev, index) => (
                            <div
                                key={index}
                                className="relative bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
                                onClick={() => handleLinkedInClick(dev.linkedin)}
                            >
                                <div className="flex items-center mb-4">
                                    <FaLaptopCode className="text-4xl text-indigo-500 mr-4" />
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{dev.name}</h3>
                                        <p className="text-indigo-600 font-medium">{dev.role}</p>
                                    </div>
                                </div>
                                <p className="text-slate-500">{dev.id}</p>
                                <FaLinkedin className="absolute top-5 right-5 text-2xl text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Faculty Core Team Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 border-b-2 border-teal-500 pb-3 text-slate-800">
                        Faculty Core Team
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {facultyTeam.map((faculty, index) => (
                            <div
                                key={index}
                                className="relative bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
                                onClick={() => handleLinkedInClick(faculty.linkedin)}
                            >
                                <div className="flex items-center">
                                    <FaUserTie className="text-4xl text-teal-500 mr-4" />
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{faculty.name}</h3>
                                        <p className="text-teal-600 font-medium">{faculty.role}</p>
                                    </div>
                                </div>
                                <FaLinkedin className="absolute top-5 right-5 text-2xl text-slate-400 group-hover:text-teal-600 transition-colors" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}