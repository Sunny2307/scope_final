import React, { createContext, useContext, useState, useEffect } from 'react';

const DeanContext = createContext();

export const useDeanContext = () => {
    const context = useContext(DeanContext);
    if (!context) {
        throw new Error('useDeanContext must be used within a DeanContextProvider');
    }
    return context;
};

export const DeanContextProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        guideName: '',
        leaveType: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
    });

    // Fetch all students with their leave data
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/dean/students');
            if (!response.ok) {
                throw new Error('Failed to fetch students data');
            }
            const data = await response.json();
            setStudents(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update filters
    const updateFilters = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    // Get filtered and sorted students
    const getFilteredStudents = () => {
        let filtered = [...students];

        // Filter by guide name
        if (filters.guideName) {
            filtered = filtered.filter(student => 
                student.guideName?.toLowerCase().includes(filters.guideName.toLowerCase())
            );
        }

        // Filter by leave type
        if (filters.leaveType !== 'all') {
            filtered = filtered.filter(student => {
                switch (filters.leaveType) {
                    case 'cl':
                        return student.clTaken > 0;
                    case 'dl':
                        return student.dlTaken > 0;
                    case 'lwp':
                        return student.lwpTaken > 0;
                    default:
                        return true;
                }
            });
        }

        // Sort students
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
                case 'name':
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
                    break;
                case 'cl':
                    aValue = a.clTaken || 0;
                    bValue = b.clTaken || 0;
                    break;
                case 'dl':
                    aValue = a.dlTaken || 0;
                    bValue = b.dlTaken || 0;
                    break;
                case 'lwp':
                    aValue = a.lwpTaken || 0;
                    bValue = b.lwpTaken || 0;
                    break;
                case 'total':
                    aValue = a.totalLeaves || 0;
                    bValue = b.totalLeaves || 0;
                    break;
                default:
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    // Get statistics
    const getStatistics = () => {
        const totalStudents = students.length;
        const highClUsage = students.filter(s => {
            const percentage = s.clTotal > 0 ? (s.clTaken / s.clTotal) * 100 : 0;
            return percentage >= 80;
        }).length;
        const activeLwp = students.filter(s => s.lwpTaken > 0).length;
        const avgLeaveUsage = totalStudents > 0 
            ? Math.round(students.reduce((acc, s) => acc + (s.totalLeaves || 0), 0) / totalStudents)
            : 0;

        return {
            totalStudents,
            highClUsage,
            activeLwp,
            avgLeaveUsage
        };
    };

    const value = {
        students,
        loading,
        error,
        filters,
        fetchStudents,
        updateFilters,
        getFilteredStudents,
        getStatistics
    };

    return (
        <DeanContext.Provider value={value}>
            {children}
        </DeanContext.Provider>
    );
};

export default DeanContext;

