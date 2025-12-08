// src/components/guide/BatchInfoContent.jsx

import React, { useState, useEffect, useContext } from 'react';
import api from '../../lib/api';
import { GuideContext } from '../../context/GuideContext';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export default function BatchInfoContent() {
    const { user } = useContext(GuideContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch students from backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await api.get('/api/auth/guide/students', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAllStudents(response.data.students);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch students:', error.response?.data?.error || error.message);
                setError('Failed to load students');
                setAllStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Filter students based on search
    useEffect(() => {
        let filtered = allStudents;
        if (searchTerm) {
            filtered = allStudents.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredStudents(filtered);
    }, [searchTerm, allStudents]);

    const guideName = user?.name || "Guide";

    return (
        <>
            {/* Custom styles for the scrollbar */}
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
            `}</style>
            {/* The root container is now a flex column that fills the height of its parent */}
            <div className="p-4 md:p-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-700 tracking-tight mb-2">Batch Information</h2>
                <p className="text-gray-500 mb-6">A list of all students assigned to you, {guideName}.</p>

                {/* The white card now grows to fill available space */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full md:w-1/2">
                            <input
                                type="text"
                                placeholder="Search by student name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 text-gray-900"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <SearchIcon />
                            </div>
                        </div>
                    </div>

                    {/* This container scrolls and takes up the remaining space in the card */}
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {loading ? (
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                                <p className="text-gray-500 mt-2">Loading students...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10">
                                <p className="text-red-500">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">SR. NO.</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">STUDENT ID</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">STUDENT NAME</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">BATCH</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                                            <td className="py-3 px-4 text-gray-700 font-medium">{student.id}</td>
                                            <td className="py-3 px-4 text-gray-700">{student.name}</td>
                                            <td className="py-3 px-4 text-gray-700">{student.batch}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && !error && filteredStudents.length === 0 && (
                             <div className="text-center py-10">
                                <p className="text-gray-500">No students found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
