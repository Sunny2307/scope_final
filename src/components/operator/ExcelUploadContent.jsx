import React, { useState, useRef } from 'react';
import api from '../../lib/api';

const ExcelUploadContent = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [uploadHistory, setUploadHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];
            
            if (validTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please select a valid Excel file (.xlsx, .xls) or CSV file');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.post('/api/excel/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResults(response.data);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            // Refresh upload history
            fetchUploadHistory();
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.error || error.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const fetchUploadHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await api.get('/api/excel/history', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUploadHistory(response.data.recentLeaves || []);
        } catch (error) {
            console.error('Failed to fetch upload history:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getLeaveTypeBadgeClass = (leaveType) => {
        switch (leaveType?.toLowerCase()) {
            case 'cl': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'lwp': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'dl': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Excel Upload & Processing</h2>
                <p className="text-gray-600 mt-2">
                    Upload Excel files to automatically generate leave records for absent students
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Excel File
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            !file || uploading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {uploading ? 'Processing...' : 'Upload & Process'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {results && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{results.results.processed}</p>
                            <p className="text-sm text-blue-700">Employees Processed</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{results.results.leavesGenerated}</p>
                            <p className="text-sm text-green-700">Leaves Generated</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{results.results.errors.length}</p>
                            <p className="text-sm text-yellow-700">Errors</p>
                        </div>
                    </div>

                    {/* Employee Summary */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Employee Summary</h4>
                        {results.results.summary.map((employee, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h5 className="font-medium text-gray-900">
                                            {employee.employeeName} ({employee.employeeId})
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                            {employee.leavesGenerated} leaves generated
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {employee.absentDays.length} absent days
                                    </span>
                                </div>
                                
                                {employee.absentDays.length > 0 && (
                                    <div className="space-y-2">
                                        <h6 className="text-sm font-medium text-gray-700">Absent Days Processing:</h6>
                                        <div className="flex flex-wrap gap-2">
                                            {employee.absentDays.map((day, dayIndex) => (
                                                <div
                                                    key={dayIndex}
                                                    className={`px-3 py-2 text-xs rounded-md border ${
                                                        day.leaveGenerated
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : day.reason === 'Leave already exists'
                                                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                            : 'bg-red-100 text-red-800 border-red-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span>{day.date}</span>
                                                        {day.leaveGenerated ? (
                                                            <span className="text-green-600">✓</span>
                                                        ) : day.reason === 'Leave already exists' ? (
                                                            <span className="text-blue-600">ℹ</span>
                                                        ) : (
                                                            <span className="text-red-600">✗</span>
                                                        )}
                                                    </div>
                                                    {day.reason && (
                                                        <div className="text-xs mt-1 opacity-75">
                                                            {day.reason}
                                                        </div>
                                                    )}
                                                    {day.error && (
                                                        <div className="text-xs mt-1 opacity-75">
                                                            Error: {day.error}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {employee.errors.length > 0 && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-800 font-medium mb-2">Errors:</p>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            {employee.errors.map((error, errorIndex) => (
                                                <li key={errorIndex}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload History Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Auto-Generated Leaves</h3>
                    <button
                        onClick={() => {
                            setShowHistory(!showHistory);
                            if (!showHistory) {
                                fetchUploadHistory();
                            }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {showHistory ? 'Hide' : 'Show'} History
                    </button>
                </div>

                {showHistory && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leave Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Generated Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {uploadHistory.map((leave) => (
                                    <tr key={leave.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {leave.employeeId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {leave.employeeName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getLeaveTypeBadgeClass(leave.leaveType)}`}>
                                                {leave.leaveType || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(leave.startDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(leave.applicationDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {uploadHistory.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No auto-generated leaves found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExcelUploadContent;
