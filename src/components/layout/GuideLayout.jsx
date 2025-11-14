import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GuideDashboardHeader from './GuideDashboardHeader';
import GuideSidebar from './GuideSidebar';
import DashboardFooter from './DashboardFooter';

export default function GuideLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('Home');
    const location = useLocation();

    // This hook listens for URL changes and updates the active sidebar item.
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/guide/batch-info')) {
            setActiveItem('Batch Info');
        } else if (path.includes('/guide/report-generation')) {
            setActiveItem('Report Generation');
        } else {
            setActiveItem('Home');
        }
    }, [location]);

    return (
        <div className="w-screen h-screen bg-white flex flex-col">
            <GuideDashboardHeader />
            <div className="flex flex-1 overflow-y-hidden">
                <GuideSidebar
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeItem={activeItem}
                />
                {/* The Outlet is where the router will render the page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
            <DashboardFooter />
        </div>
    );
}
