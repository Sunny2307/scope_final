// src/pages/student/StudentDashboard.jsx

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DashboardContent from '../../components/student/DashboardContent';
import { StudentContext } from '../../context/StudentContext';

// The 'onApplyLeaveClick' prop is removed from here
export default function StudentDashboard() {
    const { isLoading } = useContext(StudentContext);
    const navigate = useNavigate(); // Get the navigate function from the hook

    // This function defines what happens when the button is clicked
    const handleApplyLeaveClick = () => {
        console.log('Apply Leave button clicked!'); // Debug log
        navigate('/student/apply-leave');
    };

    if (isLoading) {
        return (
            <div className="w-screen h-screen bg-white flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
                        <p className="text-xl font-medium text-gray-700">Loading Dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Pass the newly created handler to the DashboardContent component
    return <DashboardContent onApplyLeaveClick={handleApplyLeaveClick} />;
}