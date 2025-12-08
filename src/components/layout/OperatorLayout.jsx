import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import api from '../../lib/api';
import OperatorDashboardHeader from './OperatorDashboardHeader';
import OperatorSidebar from './OperatorSidebar';
import DashboardFooter from './DashboardFooter';

export default function OperatorLayout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('Home');
    const location = useLocation();

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    const response = await api.get('/api/auth/verify-token', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data.role === 'OPERATOR') {
                        setUser(response.data);
                        setLoading(false);
                    } else {
                        localStorage.removeItem('token');
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('token');
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    // This hook listens for URL changes and updates the active sidebar item.
    // Only run when user is authenticated to avoid hooks order issues
    useEffect(() => {
        if (user && user.role === 'OPERATOR') {
            const path = location.pathname;
            if (path.includes('/operator/import-excel')) {
                setActiveItem('Import Excel');
            } else if (path.includes('/operator/pending-students')) {
                setActiveItem('Pending Students');
            } else if (path.includes('/operator/student-management')) {
                setActiveItem('Student Management');
            } else if (path.includes('/operator/guide-management')) {
                setActiveItem('Guide Management');
            } else if (path.includes('/operator/report-generation')) {
                setActiveItem('Report Generation');
            } else if (path.includes('/operator/dashboard')) {
                setActiveItem('Home');
            } else {
                setActiveItem('Home');
            }
        }
    }, [location, user]);

    // Check if user is authenticated and has OPERATOR role
    if (loading) {
        return (
            <div className="w-screen h-screen bg-white flex flex-col">
                {/* Skeleton Header */}
                <div className="h-16 bg-gray-100 animate-pulse"></div>
                
                <div className="flex flex-1 overflow-y-hidden">
                    {/* Skeleton Sidebar */}
                    <div className="w-64 bg-gray-100 animate-pulse"></div>
                    
                    {/* Skeleton Main Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        <div className="animate-pulse">
                            {/* Skeleton Welcome Section */}
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                            
                            {/* Skeleton Search and Filters */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <div className="flex justify-between items-center mb-4 gap-6">
                                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                                    <div className="flex gap-3">
                                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                                
                                {/* Skeleton Table */}
                                <div className="space-y-3">
                                    <div className="h-12 bg-gray-200 rounded"></div>
                                    <div className="h-12 bg-gray-200 rounded"></div>
                                    <div className="h-12 bg-gray-200 rounded"></div>
                                    <div className="h-12 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                
                {/* Skeleton Footer */}
                <div className="h-16 bg-gray-100 animate-pulse"></div>
            </div>
        );
    }

    if (!user || user.role !== 'OPERATOR') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="w-screen h-screen bg-white flex flex-col">
            <OperatorDashboardHeader />
            <div className="flex flex-1 overflow-y-hidden">
                <OperatorSidebar
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
