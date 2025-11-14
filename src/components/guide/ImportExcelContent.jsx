import React, { useState } from 'react';
import { FiUpload, FiFile, FiDownload, FiInfo } from 'react-icons/fi';

export default function ImportExcelContent() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState(null);
	const [dragActive, setDragActive] = useState(false);

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
			setSelectedFile(file);
			setUploadStatus(null);
		} else {
			alert('Please select a valid Excel file (.xlsx or .xls)');
		}
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
			setSelectedFile(file);
			setUploadStatus(null);
		} else {
			alert('Please drop a valid Excel file (.xlsx or .xls)');
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			alert('Please select a file first');
			return;
		}

		setIsUploading(true);
		setUploadStatus(null);

		try {
			// Simulate file upload - replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log('Uploading file:', selectedFile.name);
			setUploadStatus('success');
			setTimeout(() => {
				setSelectedFile(null);
				setUploadStatus(null);
			}, 3000);
		} catch (error) {
			console.error('Upload error:', error);
			setUploadStatus('error');
		} finally {
			setIsUploading(false);
		}
	};

	const downloadTemplate = () => {
		const templateData = [
			['Student ID', 'Name', 'Email', 'Department', 'Guide'],
			['CS2024001', 'John Doe', 'john@example.com', 'Computer Science', 'Dr. Smith'],
			['CS2024002', 'Jane Smith', 'jane@example.com', 'Computer Science', 'Dr. Johnson'],
		];
		const csvContent = templateData.map((row) => row.join(',')).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'student_data_template.csv';
		a.click();
		window.URL.revokeObjectURL(url);
	};

	return (
		<>
			<style>{`
				.custom-scrollbar::-webkit-scrollbar { width: 6px; }
				.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
				.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
				.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
			`}</style>
			<div className="p-4 md:p-6 h-full flex flex-col">
				<h2 className="text-2xl font-bold text-gray-700 tracking-tight mb-2">Import Excel</h2>
				<p className="text-gray-500 mb-6">Upload Excel files to import student or attendance data.</p>

				{/* Fixed card that fills remaining space */}
				<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
					{/* Optional top controls could go here */}

					{/* Scrollable inner content */}
					<div className="overflow-y-auto custom-scrollbar flex-1">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Upload Section */}
							<div className="lg:col-span-2 space-y-6">
								{/* File Upload Area */}
								<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
									<div className="flex items-center gap-3 mb-6">
										<FiUpload className="text-2xl text-blue-500" />
										<h2 className="text-xl font-bold text-gray-800">Upload Excel File</h2>
									</div>
									<div
										className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
											dragActive ? 'border-blue-400 bg-blue-50' : selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
										}`}
										onDragEnter={handleDrag}
										onDragLeave={handleDrag}
										onDragOver={handleDrag}
										onDrop={handleDrop}
									>
										<input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-upload" />
										<label htmlFor="file-upload" className="cursor-pointer">
											<FiFile className="mx-auto text-4xl text-gray-400 mb-4" />
											<p className="text-lg font-medium text-gray-700 mb-2">{selectedFile ? selectedFile.name : 'Drop your Excel file here or click to browse'}</p>
											<p className="text-sm text-gray-500">Supports .xlsx and .xls files (Max 10MB)</p>
										</label>
									</div>
									{selectedFile && (
										<div className="mt-6 flex items-center justify-between">
											<div className="flex items-center gap-3">
												<FiFile className="text-green-500" />
												<span className="text-sm text-gray-600">{selectedFile.name}</span>
											</div>
											<button onClick={handleUpload} disabled={isUploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
												{isUploading ? 'Uploading...' : 'Upload File'}
											</button>
										</div>
									)}
									{uploadStatus && (
										<div className={`mt-4 p-3 rounded-lg ${uploadStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
											{uploadStatus === 'success' ? 'File uploaded successfully!' : 'Upload failed. Please try again.'}
										</div>
									)}
								</div>

								{/* Upload History */}
								<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
									<h3 className="text-lg font-bold text-gray-800 mb-4">Recent Uploads</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center gap-3">
												<FiFile className="text-blue-500" />
												<div>
													<p className="font-medium text-gray-800">student_data_2024.xlsx</p>
													<p className="text-sm text-gray-500">Uploaded 2 hours ago</p>
												</div>
											</div>
											<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Success</span>
										</div>
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center gap-3">
												<FiFile className="text-blue-500" />
												<div>
													<p className="font-medium text-gray-800">attendance_jan.xlsx</p>
													<p className="text-sm text-gray-500">Uploaded 1 day ago</p>
												</div>
											</div>
											<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Success</span>
										</div>
									</div>
								</div>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								{/* Template Download */}
								<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
									<div className="flex items-center gap-3 mb-4">
										<FiDownload className="text-2xl text-green-500" />
										<h3 className="text-lg font-bold text-gray-800">Download Template</h3>
									</div>
									<p className="text-sm text-gray-600 mb-4">Download our Excel template to ensure your data is formatted correctly.</p>
									<button onClick={downloadTemplate} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Download Template</button>
								</div>
								{/* Instructions */}
								<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
									<div className="flex items-center gap-3 mb-4">
										<FiInfo className="text-2xl text-orange-500" />
										<h3 className="text-lg font-bold text-gray-800">Instructions</h3>
									</div>
									<div className="space-y-3 text-sm text-gray-600">
										<div>
											<p className="font-medium text-gray-800 mb-1">Supported Formats:</p>
											<p>• Excel (.xlsx, .xls)</p>
											<p>• CSV files</p>
										</div>
										<div>
											<p className="font-medium text-gray-800 mb-1">File Requirements:</p>
											<p>• Maximum size: 10MB</p>
											<p>• First row should contain headers</p>
											<p>• Use the template for best results</p>
										</div>
										<div>
											<p className="font-medium text-gray-800 mb-1">Data Types:</p>
											<p>• Student information</p>
											<p>• Attendance records</p>
											<p>• Leave applications</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
