// src/pages/student/EnjoyedLeavePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnjoyedLeaveContent from '../../components/student/EnjoyedLeaveContent';
import DashboardHeader from '../../components/layout/DashboardHeader';
import DashboardFooter from '../../components/layout/DashboardFooter';
import Sidebar from '../../components/layout/Sidebar';

export default function EnjoyedLeavePage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    // This handler will navigate to the previous page in the browser's history
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="w-screen h-screen bg-white flex flex-col">
            <DashboardHeader />
            <div className="flex flex-1 overflow-y-hidden">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeItem="Enjoyed Leave" // Set the active item for the sidebar
                />
                <EnjoyedLeaveContent onBack={handleBack} />
            </div>
            <DashboardFooter />
        </div>
    );
}
