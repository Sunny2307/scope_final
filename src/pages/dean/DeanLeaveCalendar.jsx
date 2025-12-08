import React, { useState, useEffect } from 'react';
import { FiCalendar, FiFilter, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DeanDashboardHeader from '../../components/dean/DeanDashboardHeader';
import DeanSidebar from '../../components/dean/DeanSidebar';
import DashboardFooter from '../../components/layout/DashboardFooter';
import { API_BASE_URL } from '../../lib/api';

const DeanLeaveCalendar = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Date range state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Filters state
    const [filters, setFilters] = useState({
        studentName: '',
        guideName: '',
        department: '',
        sortBy: 'name',
        sortOrder: 'asc'
    });

    // Fetch students data from API
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/dean/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch students data');
            }
            const data = await response.json();
            setStudents(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to load students data');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Filter and process students based on date range and filters
    useEffect(() => {
        let filtered = [...students];

        // Filter by date range if dates are selected
        if (startDate && endDate) {
            filtered = filtered.map(student => {
                // Filter leaves that overlap with date range (check if leave overlaps with selected range)
                const start = new Date(startDate);
                const end = new Date(endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                
                const filteredLeaves = (student.previousLeaves || []).filter(leave => {
                    const leaveStart = new Date(leave.date);
                    // Estimate leave end date (assuming leave.date is start date and we have days)
                    const leaveEnd = new Date(leaveStart);
                    leaveEnd.setDate(leaveEnd.getDate() + (leave.days - 1));
                    leaveStart.setHours(0, 0, 0, 0);
                    leaveEnd.setHours(23, 59, 59, 999);
                    
                    // Check if leave overlaps with date range
                    return leaveStart <= end && leaveEnd >= start;
                });

                // Calculate leave counts within date range
                // For date-filtered view, we use the actual days from the filtered leaves
                const clTaken = filteredLeaves
                    .filter(l => l.type === 'CL')
                    .reduce((sum, l) => sum + l.days, 0);
                const dlTaken = filteredLeaves
                    .filter(l => l.type === 'DL')
                    .length; // DL is counted as number of leaves, not days
                const lwpTaken = filteredLeaves
                    .filter(l => l.type === 'LWP')
                    .reduce((sum, l) => sum + l.days, 0);
                const totalLeaves = clTaken + dlTaken + lwpTaken;

                return {
                    ...student,
                    clTaken,
                    dlTaken,
                    lwpTaken,
                    totalLeaves,
                    filteredLeaves
                };
            }).filter(student => student.totalLeaves > 0); // Only show students with leaves in range
        }

        // Filter by student name
        if (filters.studentName) {
            filtered = filtered.filter(student => 
                student.name.toLowerCase().includes(filters.studentName.toLowerCase())
            );
        }

        // Filter by guide name
        if (filters.guideName) {
            filtered = filtered.filter(student => 
                student.guideName.toLowerCase().includes(filters.guideName.toLowerCase())
            );
        }

        // Filter by department
        if (filters.department) {
            filtered = filtered.filter(student => 
                student.department.toLowerCase().includes(filters.department.toLowerCase())
            );
        }

        // Sort students
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'cl':
                    aValue = a.clTaken;
                    bValue = b.clTaken;
                    break;
                case 'dl':
                    aValue = a.dlTaken;
                    bValue = b.dlTaken;
                    break;
                case 'total':
                    aValue = a.totalLeaves;
                    bValue = b.totalLeaves;
                    break;
                default:
                    aValue = a.totalLeaves;
                    bValue = b.totalLeaves;
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredStudents(filtered);
    }, [students, startDate, endDate, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleStudentClick = (student) => {
        navigate(`/dean/student/${student.id}`, { 
            state: { student: student } 
        });
    };

    if (loading) {
        return (
            <div className="w-screen h-screen bg-white flex flex-col">
                <DeanDashboardHeader />
                <div className="flex flex-1 overflow-y-auto relative">
                    <DeanSidebar
                        isSidebarOpen={isSidebarOpen}
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        activeItem="Leave Calendar"
                    />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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
                    activeItem="Leave Calendar"
                />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
                    <div className="space-y-6">
                        {/* Date Range Section */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                    <FiCalendar className="text-white" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Select Date Range</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900 cursor-pointer relative z-0"
                                            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900 cursor-pointer relative z-0"
                                            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {(!startDate || !endDate) && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        Please select both start and end dates to view leave data.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Filters Section */}
                        {(startDate && endDate) && (
                            <>
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                                <FiFilter className="text-white" size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800">Filters & Sorting</h3>
                                        </div>
                                        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-4 py-2 rounded-lg font-semibold border border-cyan-200">
                                            Total Students: {filteredStudents.length}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {/* Student Name Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Search by student name..."
                                                    value={filters.studentName}
                                                    onChange={(e) => handleFilterChange('studentName', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Guide Name Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Guide Name</label>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Search by guide name..."
                                                    value={filters.guideName}
                                                    onChange={(e) => handleFilterChange('guideName', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Department Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Search by department..."
                                                    value={filters.department}
                                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Sort By */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-cyan-50 transition-colors text-gray-900"
                                            >
                                                <option value="name">Student Name</option>
                                                <option value="cl">CL Taken</option>
                                                <option value="dl">DL Taken</option>
                                                <option value="total">Total Leaves</option>
                                            </select>
                                        </div>

                                        {/* Sort Order */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleFilterChange('sortOrder', 'asc')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                                        filters.sortOrder === 'asc'
                                                            ? 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-300 text-cyan-700 shadow-md'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50 hover:border-cyan-200'
                                                    }`}
                                                >
                                                    <FiArrowUp size={16} />
                                                    Asc
                                                </button>
                                                <button
                                                    onClick={() => handleFilterChange('sortOrder', 'desc')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                                        filters.sortOrder === 'desc'
                                                            ? 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-300 text-cyan-700 shadow-md'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50 hover:border-cyan-200'
                                                    }`}
                                                >
                                                    <FiArrowDown size={16} />
                                                    Desc
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Students Table */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Student Leave Overview ({startDate} to {endDate})
                                        </h3>
                                    </div>
                                    
                                    {/* Fixed Header Table with Scrollable Body */}
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                        <table className="min-w-full bg-transparent border-separate border-spacing-0">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                                                <tr>
                                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Student Name
                                                    </th>
                                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Guide Name
                                                    </th>
                                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Department
                                                    </th>
                                                    <th className="py-3 px-6 text-center text-xs font-semibold text-cyan-600 uppercase tracking-wider bg-cyan-50">CL</th>
                                                    <th className="py-3 px-6 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50">DL</th>
                                                    <th className="py-3 px-6 text-center text-xs font-semibold text-orange-600 uppercase tracking-wider bg-orange-50">LWP</th>
                                                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">Total Leaves</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredStudents.map((student) => (
                                                    <tr 
                                                        key={student.id} 
                                                        className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-cyan-300"
                                                        onClick={() => handleStudentClick(student)}
                                                    >
                                                        <td className="py-4 px-6 whitespace-nowrap">
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {student.name}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {student.guideName}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {student.department}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* CL Column */}
                                                        <td className="py-4 px-6 whitespace-nowrap text-center bg-cyan-50">
                                                            <div className="text-sm font-semibold text-cyan-700">
                                                                {student.clTaken}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* DL Column */}
                                                        <td className="py-4 px-6 whitespace-nowrap text-center bg-blue-50">
                                                            <div className="text-sm font-semibold text-blue-700">
                                                                {student.dlTaken}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* LWP Column */}
                                                        <td className="py-4 px-6 whitespace-nowrap text-center bg-orange-50">
                                                            <div className="text-sm font-semibold text-orange-700">
                                                                {student.lwpTaken || 0}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Total Leaves */}
                                                        <td className="py-4 px-6 whitespace-nowrap text-center bg-gray-50">
                                                            <div className="text-sm font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded-full inline-block">
                                                                {student.totalLeaves}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {filteredStudents.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No students found with leaves in the selected date range.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
            <DashboardFooter />
        </div>
    );
};

export default DeanLeaveCalendar;

