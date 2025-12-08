import React, { useState, useContext, useEffect } from 'react';
import { StudentContext } from '../../context/StudentContext';
import DashboardHeader from '../layout/DashboardHeader';
import DashboardFooter from '../layout/DashboardFooter';
import Sidebar from '../layout/Sidebar';
import api from '../../lib/api';

export default function DashboardContent({ onApplyLeaveClick }) {
    const { user } = useContext(StudentContext);
    const [selectedLeaveType, setSelectedLeaveType] = useState('CL');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Debug logging
    useEffect(() => {
        console.log('=== DashboardContent: User Data Received ===');
        console.log('Full user object:', JSON.stringify(user, null, 2));
        console.log('user?.department:', user?.department);
        console.log('user?.guide:', user?.guide);
        console.log('user?.coGuide:', user?.coGuide);
        console.log('Type of user?.department:', typeof user?.department);
        console.log('Type of user?.guide:', typeof user?.guide);
        console.log('Type of user?.coGuide:', typeof user?.coGuide);
        console.log('user?.department || "...":', user?.department || '...');
        console.log('user?.guide || "...":', user?.guide || '...');
        console.log('user?.coGuide || "...":', user?.coGuide || '...');
        console.log('=== DashboardContent: End Debug ===');
    }, [user]);

    const [leaveData, setLeaveData] = useState({
        CL: { balance: '0/30', history: [] },
        DL: { balance: '0', history: [] },
        LWP: { balance: '0', history: [] },
    });

    const [scholarshipData, setScholarshipData] = useState({
        currentMonth: {
            baseAmount: 30000,
            lwpDeduction: 0,
            finalAmount: 30000,
            contingencyAmount: 0,
            perDayRate: 0,
            lwpDays: 0,
            lwpDaysFromRecords: 0,
            lwpDaysFromOverflow: 0,
            daysInMonth: 30,
        },
        previousMonths: []
    });

    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user?.email) return;

        setIsDataLoading(true);
        
        // Fetch both APIs in parallel for faster loading
        Promise.all([
            api.get('/api/auth/student/leave-summary', {
                headers: { Authorization: `Bearer ${token}` },
            }),
            api.get('/api/auth/student/scholarships', {
                headers: { Authorization: `Bearer ${token}` },
            })
        ])
        .then(([leaveResponse, scholarshipResponse]) => {
            setLeaveData(leaveResponse.data);
            setScholarshipData((prev) => ({
                currentMonth: {
                    ...prev.currentMonth,
                    ...(scholarshipResponse.data?.currentMonth || {}),
                },
                previousMonths: scholarshipResponse.data?.previousMonths || [],
            }));
        })
        .catch(error => {
            console.error('Failed to fetch dashboard data:', error.response?.data?.error || error.message);
        })
        .finally(() => {
            setIsDataLoading(false);
        });
    }, [user?.email]);

    const leaveCardHoverStyles = {
        CL: 'hover:bg-cyan-50 hover:border-cyan-300',
        DL: 'hover:bg-green-50 hover:border-green-300',
        LWP: 'hover:bg-red-50 hover:border-red-300',
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getStatusClass = (status) => {
        const lowerStatus = (status || '').toLowerCase();
        if (lowerStatus.includes('approved')) return 'bg-green-100 text-green-800';
        if (lowerStatus.includes('pending')) return 'bg-yellow-100 text-yellow-800';
        if (lowerStatus.includes('rejected')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getLeaveCardClass = (key) => {
        switch (key) {
            case 'CL': return 'border-cyan-400 bg-cyan-50';
            case 'DL': return 'border-green-400 bg-green-50';
            case 'LWP': return 'border-red-400 bg-red-50';
            default: return 'border-gray-200 bg-white';
        }
    };

    return (
        <div className="w-screen h-screen bg-white flex flex-col">
            <DashboardHeader />
            <div className="flex flex-1 overflow-y-auto relative">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-500 tracking-tight">Welcome, {user?.name || 'Student'}{user?.studentId ? ` - ${user.studentId}` : ''}</h2>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2 text-base font-semibold whitespace-nowrap">Dept: {user?.department || '...'}</span>
                            <div className="bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2 text-base font-semibold flex flex-col gap-1">
                                <span className="whitespace-nowrap">Guide: {user?.guide || '...'}</span>
                                <span className="whitespace-nowrap">Co-Guide: {user?.coGuide || '...'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 flex flex-col h-full min-h-[340px]">
                            <div className="flex justify-between items-center mb-4 relative">
                                <h3 className="text-lg font-bold text-gray-800">Leave Status</h3>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Button clicked directly!');
                                        onApplyLeaveClick();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out
                                                 bg-cyan-500 text-white
                                                 hover:bg-cyan-600 hover:shadow-lg hover:-translate-y-0.5
                                                 active:bg-cyan-700 active:scale-95
                                                 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
                                                 relative z-10"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14"/><path d="M12 5v14"/>
                                    </svg>
                                    Apply Leave
                                </button>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {Object.entries(leaveData).map(([key, value]) => {
                                    const isActive = selectedLeaveType === key;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => setSelectedLeaveType(isActive ? null : key)}
                                            className={`group p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 
                                                ${isActive 
                                                    ? getLeaveCardClass(key) 
                                                    : `bg-white border-gray-200 ${leaveCardHoverStyles[key]}`
                                                }`}
                                        >
                                            <p className="font-semibold text-sm text-gray-600">
                                                {key === 'CL' ? 'Casual Leave' : key === 'DL' ? 'Duty Leave' : 'Leave Without Pay'} ({key})
                                            </p>
                                             <p className="text-2xl mt-1 font-bold text-gray-800">
                                                 {key === 'LWP'
                                                     ? (value.balance ? value.balance.split('(')[0].trim() : value.balance)
                                                     : value.balance}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedLeaveType && (
                                <div className="animate-fade-in">
                                    <h4 className="font-bold text-md mb-2 text-gray-800">{selectedLeaveType} History</h4>
                                    <div className="overflow-x-auto rounded-lg border bg-white">
                                        <table className="min-w-full bg-transparent border-separate border-spacing-0">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase border-b w-[45%]">Dates</th>
                                                    <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase border-b w-[25%]">Duration</th>
                                                    <th className="py-2 px-4 text-center text-xs font-semibold text-gray-500 uppercase border-b w-[30%]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const history = leaveData[selectedLeaveType].history || [];
                                                    const placeholder = {}; 
                                                    const rows = [...history, ...Array(Math.max(0, 3 - history.length)).fill(placeholder)].slice(0, 3);
                                                    return rows.map((leave, i) => (
                                                        <tr key={i} className="border-t hover:bg-gray-50 transition">
                                                            <td className="py-3 px-4 text-sm text-gray-800 align-middle whitespace-nowrap">{leave.dates || '\u00A0'}</td>
                                                            <td className="py-3 px-4 text-sm text-gray-600 align-middle whitespace-nowrap">{leave.duration || '\u00A0'}</td>
                                                            <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                                                                {leave.status ? (
                                                                    <span className={`inline-block min-w-[90px] px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(leave.status)}`}>{leave.status}</span>
                                                                ) : '\u00A0'}
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 flex flex-col h-full min-h-[340px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">This Month Earning</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 space-y-3">
                                    <div className="flex justify-between items-center text-base font-medium text-cyan-900">
                                        <span>College Scholarship (Base)</span>
                                        <span className="font-semibold">₹{formatCurrency(scholarshipData.currentMonth.baseAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-cyan-900">
                                        <span>Per Day Rate ({scholarshipData.currentMonth.daysInMonth} days)</span>
                                        <span className="font-semibold">₹{formatCurrency(scholarshipData.currentMonth.perDayRate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-cyan-900">
                                        <span>LWP Days Counted</span>
                                        <span className="font-semibold">
                                            {scholarshipData.currentMonth.lwpDays || 0}
                                            {scholarshipData.currentMonth.lwpDaysFromOverflow
                                                ? ` (CL overflow: ${scholarshipData.currentMonth.lwpDaysFromOverflow})`
                                                : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-base font-medium text-red-700">
                                        <span>LWP Deductions</span>
                                        <span className="font-semibold">- ₹{formatCurrency(scholarshipData.currentMonth.lwpDeduction)}</span>
                                    </div>
                                    <div className="border-t border-cyan-200 pt-3 flex justify-between items-center text-xl font-bold text-green-800">
                                        <span>Final Payout</span>
                                        <span>₹{formatCurrency(scholarshipData.currentMonth.finalAmount)}</span>
                                    </div>
                                </div>
                                {/* --- UPDATED SECTION --- */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-800">Previous Earnings</h4>
                                        <button
                                            className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out
                                                       bg-gray-100 text-gray-800 border border-gray-300
                                                       hover:bg-gray-200 hover:shadow
                                                       active:bg-gray-300 active:scale-95
                                                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                        >
                                            Earning History
                                        </button>
                                    </div>
                                    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 mt-6">
                                        <div className="space-y-3">
                                            {scholarshipData.previousMonths.length > 0 ? (
                                                scholarshipData.previousMonths.map((earning, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <p className="text-base text-gray-600">{earning.month} '{earning.year}</p>
                                                        <p className="font-bold text-base text-gray-800">₹{earning.amount.toLocaleString('en-IN')}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-base text-gray-500 text-center py-2">No previous earnings available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
            <DashboardFooter />
        </div>
    );
}
