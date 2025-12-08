// src/components/operator/OperatorDashboardContent.jsx

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

// --- Helper Icon Components ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-800 transition-colors">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// --- Modal Component for LWP Application Details ---
const LWPApplicationModal = ({ application, onClose }) => {
    const [actionType, setActionType] = useState(null);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!application) return null;

    const handleActionClick = (type) => setActionType(type);
    const handleCancelAction = () => {
        setActionType(null);
        setReason('');
        setError('');
    };

    const handleSubmit = async () => {
        if (reason.trim() === '') {
            setError('A reason is required to proceed.');
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.post('/api/auth/operator/leave-action', {
                leaveId: application.leaveId,
                action: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
                reason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Operator action submitted successfully:', response.data);
            setError('');
            onClose();
            
            // Refresh the page to update the leave applications list
            window.location.reload();
        } catch (error) {
            console.error('Error submitting operator action:', error.response?.data?.error || error.message);
            setError(error.response?.data?.error || 'Failed to submit action. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
            case 'approved': return 'bg-green-100 text-green-800 border border-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 border border-red-300';
            default: return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 transform transition-transform duration-300 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{application.eventName}</h2>
                        <p className="text-sm text-gray-500">Academic Year: 2024-25</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-md ${getStatusClass(application.status)}`}>
                            {application.status.toUpperCase()}
                        </span>
                        <button onClick={onClose}><CloseIcon /></button>
                    </div>
                </div>
                <div className="flex justify-between items-center py-4">
                    <p className="text-sm text-gray-600"><strong>Submission Date:</strong> {application.submissionDate}, 09:36 PM</p>
                    <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">LWP Leave</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-slideInLeftFast">
                        <h3 className="font-bold text-gray-800 mb-4">Event Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Student Information</p>
                                <p className="text-base font-semibold text-gray-800">{application.studentName} ({application.id})</p>
                                <p className="text-sm text-gray-800">{application.id.toLowerCase()}@charusat.edu.in</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Event Duration</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {application.startDate && application.endDate 
                                        ? `${new Date(application.startDate).toLocaleDateString('en-GB')} - ${new Date(application.endDate).toLocaleDateString('en-GB')}`
                                        : 'Date not available'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                                         <div className="bg-orange-50 p-4 rounded-lg border border-orange-400 animate-slideInRightFast">
                         <h3 className="font-bold text-orange-900 mb-4">LWP Information</h3>
                         <div className="space-y-4">
                             <div>
                                 <p className="text-sm text-orange-800">Student's Reason</p>
                                 <p className="text-base font-semibold text-orange-900">{application.studentRemark || 'No reason provided by student'}</p>
                                 {/* Debug info - remove in production */}
                                 {console.log('Operator Modal - Application data:', application)}
                             </div>
                         </div>
                     </div>
                </div>
                <div className="mt-6">
                    {application.status.toLowerCase() === 'pending' ? (
                        !actionType ? (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleActionClick('approve')} 
                                    disabled={isSubmitting}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                                        isSubmitting 
                                            ? 'text-gray-500 bg-gray-300 cursor-not-allowed' 
                                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                    }`}
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleActionClick('reject')} 
                                    disabled={isSubmitting}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                                        isSubmitting 
                                            ? 'text-gray-500 bg-gray-300 cursor-not-allowed' 
                                            : 'text-red-700 bg-red-100 hover:bg-red-200'
                                    }`}
                                >
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for {actionType === 'approve' ? 'Approval' : 'Rejection'}:
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a clear reason..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                    rows="3"
                                ></textarea>
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                <div className="flex items-center gap-3 mt-4">
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={isSubmitting}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                                            isSubmitting 
                                                ? 'text-gray-500 bg-gray-300 cursor-not-allowed' 
                                                : 'text-white bg-orange-600 hover:bg-orange-700'
                                        }`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                    <button 
                                        onClick={handleCancelAction} 
                                        disabled={isSubmitting}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                                            isSubmitting 
                                                ? 'text-gray-500 bg-gray-300 cursor-not-allowed' 
                                                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Final Decision & Reason:</h3>
                            <div className={`p-4 rounded-lg border ${
                                application.status.toLowerCase() === 'approved' 
                                ? 'bg-green-50 border-green-200 text-green-900' 
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}>
                                <p className="text-sm font-medium">{application.reason || 'No reason was provided.'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function OperatorDashboardContent() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [allApplications, setAllApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                        setAuthLoading(false);
                    } else {
                        localStorage.removeItem('token');
                        setAuthLoading(false);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('token');
                    setAuthLoading(false);
                }
            } else {
                setAuthLoading(false);
            }
        };
        
        checkAuth();
    }, []);



    // Define fetchLWPApplications function
    const fetchLWPApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.get('/api/auth/operator/lwp-applications', {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Operator Dashboard - Raw API response:', response.data);
            setAllApplications(response.data.applications || []);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch LWP applications:', error.response?.data?.error || error.message);
            setError('Failed to load LWP applications: ' + (error.response?.data?.error || error.message));
            setAllApplications([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch LWP leave applications from backend
    useEffect(() => {
        // Only fetch applications if user is authenticated and not in auth loading state
        if (authLoading) {
            return;
        }
        
        if (!user) {
            setLoading(false);
            return;
        }

        fetchLWPApplications();
    }, [user, authLoading]);

    // Filter applications based on search and status
    useEffect(() => {
        let filtered = allApplications.filter(app => 
            app.status.toLowerCase() === activeFilter.toLowerCase()
        );

        if (searchTerm) {
            filtered = filtered.filter(app => 
                app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.studentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredApplications(filtered);
    }, [searchTerm, activeFilter, allApplications]);



    // Redirect if not authenticated
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen">Access denied. Please log in as operator.</div>;
    }

    const operatorName = user?.name || "Operator";

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getFilterButtonClass = (filterName) => {
        const baseClasses = "flex-1 text-center py-2 text-sm font-semibold rounded-lg border transition-all duration-200 shadow-sm";
        if (activeFilter === filterName) {
            switch(filterName) {
                case 'Pending': return `${baseClasses} bg-yellow-100 border-yellow-400 text-yellow-900 scale-105`;
                case 'Approved': return `${baseClasses} bg-green-100 border-green-400 text-green-900 scale-105`;
                case 'Rejected': return `${baseClasses} bg-red-100 border-red-400 text-red-900 scale-105`;
                default: return '';
            }
        }
        return `${baseClasses} bg-white border-gray-300 text-gray-600 hover:bg-gray-50`;
    };

    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
                @keyframes slideInLeftFast { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInRightFast { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slideInLeftFast { animation: slideInLeftFast 0.4s ease-out; }
                .animate-slideInRightFast { animation: slideInRightFast 0.4s ease-out; }
                
                /* Smooth loading transitions */
                .loading-transition {
                    transition: all 0.3s ease-in-out;
                }
                
                .skeleton-pulse {
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }
                
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <div className={`p-4 md:p-6 h-full flex flex-col loading-transition ${selectedApplication ? 'blur-sm' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-700 tracking-tight">Welcome, {operatorName}</h2>
                        <p className="text-sm text-gray-500">
                            Managing LWP Leave Applications
                        </p>
                    </div>
                </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 gap-6">
                        <div className="relative w-full md:w-1/3">
                            <input 
                                type="text"
                                placeholder="Search by ID number"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-gray-900"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <SearchIcon />
                            </div>
                        </div>
                        <div className="flex flex-1 items-center gap-3">
                            <button onClick={() => setActiveFilter('Pending')} className={getFilterButtonClass('Pending')}>Pending</button>
                            <button onClick={() => setActiveFilter('Approved')} className={getFilterButtonClass('Approved')}>Approved</button>
                            <button onClick={() => setActiveFilter('Rejected')} className={getFilterButtonClass('Rejected')}>Rejected</button>
                        </div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {loading ? (
                            <div className="space-y-3">
                                {/* Show table structure during loading */}
                                <div className="bg-gray-100 h-12 rounded-t-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-12 bg-gray-50 rounded animate-pulse"></div>
                                    <div className="h-12 bg-gray-50 rounded animate-pulse"></div>
                                    <div className="h-12 bg-gray-50 rounded animate-pulse"></div>
                                    <div className="h-12 bg-gray-50 rounded animate-pulse"></div>
                                </div>
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                                    <p className="text-gray-500 mt-2 text-sm">Loading LWP applications...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10">
                                <p className="text-red-500">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">SR. NO.</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">ID</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">STUDENT NAME</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">EVENT NAME</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">SUBMISSION DATE</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">BATCH</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredApplications.map((app, index) => (
                                        <tr 
                                            key={app.leaveId || app.id + index} 
                                            className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => setSelectedApplication(app)}
                                        >
                                            <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                                            <td className="py-3 px-4 text-gray-700 font-medium">{app.id}</td>
                                            <td className="py-3 px-4 text-gray-700">{app.studentName}</td>
                                            <td className="py-3 px-4 text-gray-700">{app.eventName}</td>
                                            <td className="py-3 px-4 text-gray-700">{app.submissionDate}</td>
                                            <td className="py-3 px-4 text-gray-700">{app.batch}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(app.status)}`}>
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && !error && filteredApplications.length === 0 && (
                             <div className="text-center py-10">
                                <p className="text-gray-500">No LWP applications found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedApplication && (
                <LWPApplicationModal 
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </>
    );
}
