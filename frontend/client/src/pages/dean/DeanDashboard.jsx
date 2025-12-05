import React, { useState } from 'react';
import DeanDashboardHeader from '../../components/dean/DeanDashboardHeader';
import DeanDashboardContent from '../../components/dean/DeanDashboardContent';
import DeanSidebar from '../../components/dean/DeanSidebar';
import DashboardFooter from '../../components/layout/DashboardFooter';

const DeanDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="w-screen h-screen bg-white flex flex-col">
            <DeanDashboardHeader />
            <div className="flex flex-1 overflow-y-auto relative">
                <DeanSidebar
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeItem="Dashboard"
                />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
                    <DeanDashboardContent />
                </main>
            </div>
            <DashboardFooter />
        </div>
    );
};

export default DeanDashboard;

