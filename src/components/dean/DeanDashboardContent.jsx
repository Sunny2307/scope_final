import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiArrowUp, FiArrowDown, FiUsers, FiCalendar, FiTrendingUp, FiX, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../lib/api';

const DeanDashboardContent = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        studentName: '',
        guideName: '',
        department: '',
        sortBy: 'name', // 'name', 'cl', 'dl', 'lwp', 'total'
        sortOrder: 'asc' // 'asc', 'desc'
    });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isModalAnimating, setIsModalAnimating] = useState(false);

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
            setFilteredStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to load students data');
            setStudents([]);
            setFilteredStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);


    useEffect(() => {
        let filtered = [...students];

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
                    // When sorting by name, actually sort by total leaves
                    aValue = a.totalLeaves;
                    bValue = b.totalLeaves;
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
    }, [students, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getLeavePercentage = (taken, total) => {
        if (total === 0) return 0;
        return Math.round((taken / total) * 100);
    };

    const getLeaveColor = (taken, total) => {
        const percentage = getLeavePercentage(taken, total);
        if (percentage >= 80) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getLeaveBarColor = (taken, total) => {
        const percentage = getLeavePercentage(taken, total);
        if (percentage >= 80) return 'bg-red-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
        // Trigger animation after a small delay
        setTimeout(() => {
            setIsModalAnimating(true);
        }, 50);
    };

    const closeModal = () => {
        setIsModalAnimating(false);
        setTimeout(() => {
            setShowModal(false);
            setSelectedStudent(null);
        }, 500);
    };

    const handleViewDetails = () => {
        // Navigate to detailed student page
        navigate(`/dean/student/${selectedStudent.id}`, { 
            state: { student: selectedStudent } 
        });
        closeModal();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-red-600 text-lg font-semibold">Error loading data</div>
                <div className="text-gray-600">{error}</div>
                <button
                    onClick={fetchStudents}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                            <FiFilter className="text-white" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Filters & Sorting</h3>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-4 py-2 rounded-lg font-semibold border border-cyan-200">
                        Total Students: {students.length}
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
                        Student Leave Overview
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
                                            {student.clTaken}/{student.clTotal}
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
                        <p className="text-gray-500">No students found matching the current filters.</p>
                    </div>
                )}
            </div>

            {/* Student Details Modal */}
            {showModal && selectedStudent && (
                <div 
                    className={`modal-backdrop flex items-center justify-center z-50 p-4 transition-all duration-500 ease-out ${
                        isModalAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={handleBackdropClick}
                >
                    <div className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-500 ease-out ${
                        isModalAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedStudent.guideName} - {selectedStudent.department}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex gap-6">
                                {/* Left Side - Leave Summary */}
                                <div className="w-1/2">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Leave Summary</h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600"><span className="font-medium">CL Taken:</span> {selectedStudent.clTaken}/{selectedStudent.clTotal} days</p>
                                            <p className="text-sm text-gray-600"><span className="font-medium">DL Taken:</span> {selectedStudent.dlTaken}/{selectedStudent.dlTotal} days</p>
                                            <p className="text-sm text-gray-600"><span className="font-medium">LWP Taken:</span> {selectedStudent.lwpTaken} days</p>
                                            {selectedStudent.lwpTaken > 0 && (
                                                <p className="text-sm text-red-600 font-medium">
                                                    Scholarship Cut: ₹{selectedStudent.scholarshipCut}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={closeModal}
                                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={handleViewDetails}
                                                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
                                            >
                                                <FiEye size={16} />
                                                View Full Details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Last 3 Leaves */}
                                <div className="w-1/2">
                                    <h4 className="font-semibold text-gray-900 mb-3">Last 3 Leaves</h4>
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {selectedStudent.previousLeaves && selectedStudent.previousLeaves.slice(0, 3).length > 0 ? (
                                            selectedStudent.previousLeaves.slice(0, 3).map((leave, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-cyan-500">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900 text-sm">{leave.type} - {leave.days} days</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            leave.status === 'Approved' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {leave.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600"><span className="font-medium">Date:</span> {leave.date}</p>
                                                    <p className="text-xs text-gray-600"><span className="font-medium">Reason:</span> {leave.reason}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">No previous leave records found</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeanDashboardContent;

