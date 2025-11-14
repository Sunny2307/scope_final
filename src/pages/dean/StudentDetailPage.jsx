import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCalendar, FiUser, FiBookOpen, FiTrendingUp, FiDollarSign, FiFilter, FiSearch } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import DeanDashboardHeader from '../../components/dean/DeanDashboardHeader';
import DeanSidebar from '../../components/dean/DeanSidebar';
import DashboardFooter from '../../components/layout/DashboardFooter';

const StudentDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        leaveType: '',
        status: '',
        dateRange: ''
    });
    const [filteredLeaves, setFilteredLeaves] = useState([]);

    useEffect(() => {
        // Get student data from location state or fetch from API
        if (location.state?.student) {
            setStudent(location.state.student);
            setFilteredLeaves(location.state.student.previousLeaves || []);
            setLoading(false);
        } else {
            // If no student data, redirect back to dashboard
            navigate('/dean/dashboard');
        }
    }, [location.state, navigate]);

    // Filter leaves based on current filters
    useEffect(() => {
        if (!student?.previousLeaves) return;

        let filtered = [...student.previousLeaves];

        if (filters.leaveType) {
            filtered = filtered.filter(leave => leave.type === filters.leaveType);
        }

        if (filters.status) {
            filtered = filtered.filter(leave => leave.status === filters.status);
        }

        setFilteredLeaves(filtered);
    }, [student, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleBack = () => {
        navigate('/dean/dashboard');
    };

    if (loading) {
        return (
            <div className="w-screen h-screen bg-white flex flex-col">
                <DeanDashboardHeader />
                <div className="flex flex-1 overflow-y-auto relative">
                    <DeanSidebar
                        isSidebarOpen={isSidebarOpen}
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        activeItem="Dashboard"
                    />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    </main>
                </div>
                <DashboardFooter />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="w-screen h-screen bg-white flex flex-col">
                <DeanDashboardHeader />
                <div className="flex flex-1 overflow-y-auto relative">
                    <DeanSidebar
                        isSidebarOpen={isSidebarOpen}
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        activeItem="Dashboard"
                    />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-red-600 text-lg font-semibold">Student not found</div>
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </main>
                </div>
                <DashboardFooter />
            </div>
        );
    }

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
                    {/* Page Header */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
                            >
                                <FiArrowLeft size={22} className="text-gray-600 group-hover:text-cyan-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                                <p className="text-base text-gray-600 mt-1">{student.guideName} - {student.department}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column - Student Info & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Student Information Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                    <FiUser className="text-white" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Student Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-sm font-medium text-gray-600 mb-1">Name</span>
                                    <p className="text-base text-gray-900 font-semibold">{student.name}</p>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-600 mb-1">Guide</span>
                                    <p className="text-base text-gray-900">{student.guideName}</p>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-600 mb-1">Department</span>
                                    <p className="text-base text-gray-900">{student.department}</p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Summary Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                    <FiTrendingUp className="text-white" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Leave Summary</h3>
                            </div>
                            <div className="space-y-4">
                                {/* CL Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">CL</span>
                                        <span className="text-sm font-semibold text-cyan-700">{student.clTaken}/{student.clTotal}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${(student.clTaken / student.clTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* DL Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">DL</span>
                                        <span className="text-sm font-semibold text-blue-700">{student.dlTaken}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: student.dlTaken > 0 ? '100%' : '0%' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* LWP */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">LWP</span>
                                        <span className="text-sm font-semibold text-orange-700">{student.lwpTaken || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: student.lwpTaken > 0 ? '100%' : '0%' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Total Leaves */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-900">Total Leaves</span>
                                        <span className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{student.totalLeaves}</span>
                                    </div>
                                </div>

                                {/* Scholarship Information - Show current month calculation */}
                                <div className="pt-4 border-t border-gray-200 space-y-3">
                                    <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-600">Base Scholarship</span>
                                            <span className="text-sm font-semibold text-cyan-900">₹{student.baseAmount?.toLocaleString('en-IN') || student.scholarshipAmount?.toLocaleString('en-IN') || '30,000'}</span>
                                        </div>
                                        {student.scholarshipCut > 0 && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">LWP Deduction</span>
                                                <span className="text-sm font-semibold text-red-600">-₹{student.scholarshipCut?.toLocaleString('en-IN') || '0'}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2 border-t border-cyan-200">
                                            <span className="text-sm font-bold text-gray-900">Final Amount</span>
                                            <span className="text-base font-bold text-green-700">₹{student.finalAmount?.toLocaleString('en-IN') || (student.baseAmount || student.scholarshipAmount || 30000) - (student.scholarshipCut || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Leave History with Filters */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg flex flex-col">
                            {/* Header with Filters */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                            <FiCalendar className="text-white" size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">All Leave Records</h3>
                                    </div>
                                    <div className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-4 py-2 rounded-lg font-semibold border border-cyan-200 text-sm">
                                        {filteredLeaves.length} {filteredLeaves.length === 1 ? 'Leave' : 'Leaves'}
                                    </div>
                                </div>
                                
                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                                        <select
                                            value={filters.leaveType}
                                            onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900"
                                        >
                                            <option value="">All Types</option>
                                            <option value="CL">Casual Leave</option>
                                            <option value="DL">Duty Leave</option>
                                            <option value="LWP">Leave Without Pay</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900"
                                        >
                                            <option value="">All Status</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Records</label>
                                        <div className="px-4 py-2 text-sm bg-gray-100 rounded-lg border border-gray-200 font-semibold text-gray-800">
                                            {filteredLeaves.length} {filteredLeaves.length === 1 ? 'Record' : 'Records'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Leave List - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[600px]">
                                {filteredLeaves && filteredLeaves.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredLeaves.map((leave, index) => (
                                            <div key={index} className="border border-gray-200 rounded-xl p-5 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200 hover:border-cyan-300 hover:shadow-md">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                                            leave.type === 'CL' 
                                                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' 
                                                                : leave.type === 'DL'
                                                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                                                        }`}>
                                                            {leave.type}
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-base">{leave.days} {leave.days === 1 ? 'day' : 'days'}</span>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                                        leave.status === 'Approved' 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : leave.status === 'Pending'
                                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="block text-sm font-medium text-gray-600 mb-1">Date</span>
                                                        <p className="text-base text-gray-900 font-semibold">{leave.date}</p>
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-medium text-gray-600 mb-1">Reason</span>
                                                        <p className="text-base text-gray-900">{leave.reason}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FiCalendar className="mx-auto text-gray-400" size={48} />
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Leave Records</h3>
                                        <p className="mt-2 text-sm text-gray-500">No leaves found matching the current filters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </main>
            </div>
            <DashboardFooter />
        </div>
    );
};

export default StudentDetailPage;

