import React, { useState, useRef, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../lib/api';

// Import layout components (assuming they exist in your project structure)
import DashboardHeader from '../layout/DashboardHeader';
import DashboardFooter from '../layout/DashboardFooter';
import Sidebar from '../layout/Sidebar';

// --- Helper Icon Components ---
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
        <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

 // --- Custom Input for DatePicker ---
 const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
     <div className="relative w-full" onClick={onClick} ref={ref}>
         <input
             type="text"
             value={value}
             placeholder={placeholder}
             readOnly
             className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 cursor-pointer"
         />
         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
             <CalendarIcon />
         </div>
     </div>
 ));

 // Main Content for the Apply Leave page
 export default function ApplyLeaveContent({ onBackToDashboard }) {
     const [isSidebarOpen, setIsSidebarOpen] = useState(true);
     const [leaveType, setLeaveType] = useState('');
     const [startDate, setStartDate] = useState(null);
     const [endDate, setEndDate] = useState(null);
     const [reason, setReason] = useState('');
     const [files, setFiles] = useState([]);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [submissionStatus, setSubmissionStatus] = useState(null);
     const [leaveBalances, setLeaveBalances] = useState({
         'CL Used': '0/30',
         'DL Used': '0',
         'LWP Used': '0'
     });
     const [loadingLeaveBalance, setLoadingLeaveBalance] = useState(true);

    const leaveTypes = [
        { key: 'CL', name: 'CL' },
        { key: 'DL', name: 'DL' },
        { key: 'LWP', name: 'LWP' }
    ];

         const leaveInfoData = {
         CL: { title: 'Casual Leave (CL)', description: '30 CL per year' },
         DL: { title: 'Duty Leave (DL)', description: 'For conferences/events', requiresDocs: true },
         LWP: { title: 'Leave Without Pay (LWP)', description: 'After CL exhausted', deduction: '₹1000 per day deduction' }
     };

     // Fetch leave balance data from backend
     useEffect(() => {
         const fetchLeaveBalance = async () => {
             setLoadingLeaveBalance(true);
             try {
                 const token = localStorage.getItem('token');
                 if (!token) {
                     throw new Error('No authentication token found');
                 }
                 
                const response = await api.get('/api/auth/student/leave-summary', {
                     headers: { Authorization: `Bearer ${token}` },
                 });
                 
                                   console.log('Leave balance data fetched:', response.data);
                  
                  // Transform the data to match the expected format
                  // The backend returns: { CL: { balance: "15/30" }, DL: { balance: "3" }, LWP: { balance: "2" } }
                  const balanceData = {
                      'CL Used': response.data.CL?.balance || '0/30',
                      'DL Used': response.data.DL?.balance || '0',
                      'LWP Used': response.data.LWP?.balance || '0'
                  };
                 
                 setLeaveBalances(balanceData);
             } catch (error) {
                 console.error('Failed to fetch leave balance:', error.response?.data?.error || error.message);
                 // Keep default values on error
             } finally {
                 setLoadingLeaveBalance(false);
             }
         };
         
         fetchLeaveBalance();
     }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles([e.target.files[0]]); // Only store the first file
        } else {
            setFiles([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmissionStatus(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Validate DL leave has document
            if (leaveType === 'DL' && files.length === 0) {
                alert('Please upload a document for DL leave application');
                setIsSubmitting(false);
                return;
            }

            // Validate file type and size for DL leaves
            if (leaveType === 'DL' && files.length > 0) {
                for (let file of files) {
                    if (file.type !== 'application/pdf') {
                        alert('Only PDF files are allowed');
                        setIsSubmitting(false);
                        return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        setIsSubmitting(false);
                        return;
                    }
                }
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('leaveType', leaveType);
            formData.append('startDate', startDate.toISOString());
            formData.append('endDate', endDate.toISOString());
            formData.append('reason', reason);
            
            // For DL leaves, append the document (only first file if multiple)
            if (leaveType === 'DL' && files.length > 0) {
                formData.append('document', files[0]);
            }

            console.log('Submitting Leave Request:', { leaveType, startDate, endDate, reason, hasDocument: files.length > 0 });

            const response = await api.post(
                '/api/auth/student/submitLeaveApplication',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Leave application submitted successfully:', response.data);
            setSubmissionStatus('success');

            // Reset form after successful submission and redirect to dashboard
            setTimeout(() => {
                setSubmissionStatus(null);
                setLeaveType('');
                setStartDate(null);
                setEndDate(null);
                setReason('');
                setFiles([]);
                // Navigate back to student dashboard home page
                onBackToDashboard();
            }, 2000);

        } catch (error) {
            console.error('Error submitting leave application:', error);
            setSubmissionStatus('error');
            
            // Show error message
            const errorMessage = error.response?.data?.error || error.message || 'Failed to submit leave application';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputStyle = (hasValue) => {
        return `w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
            hasValue ? 'text-gray-900' : 'text-gray-400'
        }`;
    };

    const selectedLeaveInfo = leaveInfoData[leaveType];

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
                 
                 /* Ensure DatePicker dropdown appears above other elements */
                 .react-datepicker-popper {
                     z-index: 9999 !important;
                 }
                 
                 /* Ensure all form fields don't overflow and have consistent styling */
                 select, input, textarea {
                     box-sizing: border-box;
                     resize: vertical;
                 }
                 
                 /* Ensure textarea specific styling */
                 textarea {
                     min-height: 100px;
                     max-height: 200px;
                     overflow-y: auto;
                 }
                 
                 /* Consistent focus styling for all form fields */
                 select:focus, input:focus, textarea:focus {
                     outline: none;
                     border-color: #3b82f6;
                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                 }
                 
                 /* Ensure select dropdown doesn't overflow */
                 select {
                     overflow: hidden;
                 }
             `}</style>
            <div className="w-screen h-screen bg-white flex flex-col">
                <DashboardHeader />
                <div className="flex flex-1 overflow-y-hidden relative">
                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                                         <main className="flex-1 p-4 md:p-6 bg-gray-50 flex flex-col min-h-0">
                         <div className="h-full flex flex-col min-h-[600px]">
                             <div className="flex items-center gap-4 mb-6 shrink-0">
                                <button onClick={onBackToDashboard} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                    <BackArrowIcon />
                                </button>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800">Apply for Leave</h2>
                                    <p className="text-gray-500">Submit your leave application</p>
                                </div>
                            </div>

                                                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                                 <div className="overflow-y-auto custom-scrollbar flex-1 pb-8">
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <CalendarIcon />
                                    <h3 className="text-xl font-bold text-gray-800">Leave Application Form</h3>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                                                         <div>
                                         <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                         <select id="leave-type" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900">
                                             <option value="" disabled>Select leave type</option>
                                             {leaveTypes.map(lt => (
                                                 <option key={lt.key} value={lt.key} className="text-black">{lt.name}</option>
                                             ))}
                                         </select>
                                     </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                dateFormat="dd/MM/yyyy"
                                                required
                                                placeholderText="DD/MM/YYYY"
                                                maxDate={new Date()}
                                                customInput={<CustomDateInput />}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                dateFormat="dd/MM/yyyy"
                                                required
                                                placeholderText="DD/MM/YYYY"
                                                maxDate={new Date()}
                                                customInput={<CustomDateInput />}
                                            />
                                        </div>
                                    </div>

                                                                         <div>
                                         <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                                         <textarea id="reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Please provide a detailed reason..." className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                                     </div>

                                    {leaveType === 'DL' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents</label>
                                            <label htmlFor="file-upload" className="mt-1 flex flex-col justify-center items-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-400">
                                                <div className="flex flex-col items-center space-y-1">
                                                    <FileUploadIcon />
                                                    <div className="flex text-sm text-gray-600">
                                                        <span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            Click to upload conference/event documents
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PDF (MAX 5MB)</p>
                                                    <input id="file-upload" name="file-upload" type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                                                </div>
                                            </label>
                                            {files.length > 0 && (
                                                <div className="mt-2 text-sm text-gray-500">
                                                    {files.map(file => <p key={file.name}>{file.name}</p>)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-4 pt-2">
                                        <button type="button" onClick={onBackToDashboard} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none">Cancel</button>
                                        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>
                                    </div>

                                    {submissionStatus && (
                                        <div className={`text-sm font-semibold text-right mt-2 ${submissionStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {submissionStatus === 'success' ? 'Leave application submitted successfully!' : 'Failed to submit leave application.'}
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div className="space-y-8">
                                {selectedLeaveInfo && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Information</h3>
                                        <div className="space-y-3">
                                            <p className="font-semibold text-gray-800">{selectedLeaveInfo.title}</p>
                                            <p className="text-sm text-gray-600">{selectedLeaveInfo.description}</p>
                                            {selectedLeaveInfo.requiresDocs && (
                                                <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
                                                    <InfoIcon />
                                                    <span>Documents required</span>
                                                </div>
                                            )}
                                            {selectedLeaveInfo.deduction && (
                                                <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                                                    <span>{selectedLeaveInfo.deduction}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                                                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                                     <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Balance</h3>
                                     <div className="space-y-3">
                                         {loadingLeaveBalance ? (
                                             <div className="flex items-center justify-center py-4">
                                                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                 <span className="ml-2 text-gray-600">Loading...</span>
                                             </div>
                                         ) : (
                                             Object.entries(leaveBalances).map(([key, value]) => (
                                                 <div key={key} className="flex justify-between items-center text-sm">
                                                     <span className="text-gray-600">{key}</span>
                                                     <span className="font-semibold text-gray-800">{value}</span>
                                                 </div>
                                             ))
                                         )}
                                     </div>
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
        </>
    );
}
