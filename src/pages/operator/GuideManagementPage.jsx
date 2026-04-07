import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FiList, FiUserPlus, FiUsers, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiArrowRight, FiUser } from 'react-icons/fi';

const GuideManagementPage = () => {
    const [activeTab, setActiveTab] = useState('guide-list');
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states for adding guide
    const [guideForm, setGuideForm] = useState({
        name: '',
        guideId: '',
        email: '',
        password: '',
    });

    // Form states for adding co-guide
    const [coGuideForm, setCoGuideForm] = useState({
        name: '',
        coGuideId: '',
        email: '',
        password: '',
    });

    // Batch transfer states
    const [transferForm, setTransferForm] = useState({
        fromGuideId: '',
        toGuideId: '',
    });
    const [studentsToTransfer, setStudentsToTransfer] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [transferComplete, setTransferComplete] = useState(null);

    const tabs = [
        { id: 'guide-list', name: 'Guide List', icon: FiList },
        { id: 'co-guide-list', name: 'Co-guide List', icon: FiList },
        { id: 'add-guide', name: 'Add Guide', icon: FiUserPlus },
        { id: 'add-co-guide', name: 'Add Co-guide', icon: FiUsers },
        { id: 'batch-transfer', name: 'Batch Transfer', icon: FiRefreshCw },
    ];

    // Fetch guides from API
    useEffect(() => {
        if (activeTab === 'guide-list' || activeTab === 'co-guide-list' || activeTab === 'batch-transfer') {
            fetchGuides();
        }
    }, [activeTab]);

    // Update student preview when fromGuideId changes
    useEffect(() => {
        if (transferForm.fromGuideId && guides.length > 0) {
            const fromGuide = guides.find(g => g.id === transferForm.fromGuideId);
            if (fromGuide && fromGuide.students) {
                setStudentsToTransfer(fromGuide.students);
            } else {
                setStudentsToTransfer([]);
            }
        } else {
            setStudentsToTransfer([]);
        }
    }, [transferForm.fromGuideId, guides]);

    const fetchGuides = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/auth/operator/all-guides', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGuides(response.data.guides || []);
        } catch (err) {
            console.error('Error fetching guides:', err);
            setError('Failed to fetch guides. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGuide = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await api.post('/api/auth/operator/add-guide', guideForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Guide added successfully!');
            setGuideForm({ name: '', guideId: '', email: '', password: '' });
            await fetchGuides();
        } catch (err) {
            console.error('Error adding guide:', err);
            setError(err.response?.data?.error || 'Failed to add guide. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoGuide = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await api.post('/api/auth/operator/add-co-guide', coGuideForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Co-guide added successfully!');
            setCoGuideForm({ name: '', coGuideId: '', email: '', password: '' });
            await fetchGuides();
        } catch (err) {
            console.error('Error adding co-guide:', err);
            setError(err.response?.data?.error || 'Failed to add co-guide. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewTransfer = (e) => {
        e.preventDefault();
        setError('');
        if (!transferForm.fromGuideId || !transferForm.toGuideId) {
            setError('Please select both From Guide and To Guide');
            return;
        }
        if (transferForm.fromGuideId === transferForm.toGuideId) {
            setError('From Guide and To Guide cannot be the same');
            return;
        }
        if (studentsToTransfer.length === 0) {
            setError('The selected guide has no students to transfer.');
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmTransfer = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowConfirmation(false);
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/api/auth/operator/batch-transfer', {
                fromGuideId: transferForm.fromGuideId,
                toGuideId: transferForm.toGuideId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fromGuide = guides.find(g => g.id === transferForm.fromGuideId);
            const toGuide = guides.find(g => g.id === transferForm.toGuideId);
            setTransferComplete({
                count: response.data.transferredCount || studentsToTransfer.length,
                fromName: fromGuide?.name || 'Previous Guide',
                toName: toGuide?.name || 'New Guide',
                students: studentsToTransfer,
            });
            setTransferForm({ fromGuideId: '', toGuideId: '' });
            setStudentsToTransfer([]);
            await fetchGuides();
        } catch (err) {
            console.error('Error transferring students:', err);
            setError(err.response?.data?.error || 'Failed to transfer students.');
        } finally {
            setLoading(false);
        }
    };

    const fromGuide = guides.find(g => g.id === transferForm.fromGuideId);
    const toGuide = guides.find(g => g.id === transferForm.toGuideId);

    const renderContent = () => {
        switch (activeTab) {
            case 'guide-list':
            case 'co-guide-list':
                if (loading) {
                    return (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-2">Loading...</p>
                        </div>
                    );
                }

                if (guides.length === 0) {
                    return (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No guides found. Add your first guide to get started.</p>
                        </div>
                    );
                }

                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">SR. NO.</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">NAME</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">EMAIL</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">STUDENTS</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guides.map((guide, index) => (
                                    <tr key={guide.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                                        <td className="py-3 px-4 text-gray-900 font-medium">{guide.name}</td>
                                        <td className="py-3 px-4 text-gray-900">{guide.email}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {guide.studentCount || 0} students
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${guide.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {guide.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'add-guide':
                return (
                    <div className="max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Guide</h3>
                        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}
                        {success && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{success}</div>}
                        <form onSubmit={handleAddGuide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guide Name</label>
                                <input
                                    type="text"
                                    required
                                    value={guideForm.name}
                                    onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter guide name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guide ID</label>
                                <input
                                    type="text"
                                    required
                                    value={guideForm.guideId}
                                    onChange={(e) => setGuideForm({ ...guideForm, guideId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter guide ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={guideForm.email}
                                    onChange={(e) => setGuideForm({ ...guideForm, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={guideForm.password}
                                    onChange={(e) => setGuideForm({ ...guideForm, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Create password for guide"
                                />
                                <p className="text-xs text-gray-500 mt-1">Guide will use this password to login.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Guide'}
                            </button>
                        </form>
                    </div>
                );

            case 'add-co-guide':
                return (
                    <div className="max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Co-guide</h3>
                        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}
                        {success && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{success}</div>}
                        <form onSubmit={handleAddCoGuide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Co-guide Name</label>
                                <input
                                    type="text"
                                    required
                                    value={coGuideForm.name}
                                    onChange={(e) => setCoGuideForm({ ...coGuideForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter co-guide name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Co-guide ID</label>
                                <input
                                    type="text"
                                    required
                                    value={coGuideForm.coGuideId}
                                    onChange={(e) => setCoGuideForm({ ...coGuideForm, coGuideId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter co-guide ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={coGuideForm.email}
                                    onChange={(e) => setCoGuideForm({ ...coGuideForm, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={coGuideForm.password}
                                    onChange={(e) => setCoGuideForm({ ...coGuideForm, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Create password for co-guide"
                                />
                                <p className="text-xs text-gray-500 mt-1">Co-guide will use this password to login.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Co-guide'}
                            </button>
                        </form>
                    </div>
                );

            case 'batch-transfer':
                // Success result screen
                if (transferComplete) {
                    return (
                        <div className="max-w-lg">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                <FiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                                <h3 className="text-lg font-bold text-green-800 mb-2">Transfer Successful!</h3>
                                <p className="text-green-700 mb-4">
                                    <strong>{transferComplete.count}</strong> student(s) transferred from{' '}
                                    <strong>{transferComplete.fromName}</strong> to{' '}
                                    <strong>{transferComplete.toName}</strong>.
                                </p>
                                <div className="bg-white rounded-lg border border-green-200 p-3 mb-4 text-left max-h-48 overflow-y-auto">
                                    {transferComplete.students.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 py-1 text-sm text-gray-700">
                                            <FiUser className="text-green-500 flex-shrink-0" />
                                            <span>{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setTransferComplete(null)}
                                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Do Another Transfer
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div>
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">Batch Transfer Students</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Transfer all students from one guide to another. This is useful when a guide leaves the department.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex items-start gap-2">
                                <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Transfer Form */}
                            <div>
                                <form onSubmit={handlePreviewTransfer} className="space-y-4">
                                    {/* From Guide */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Guide <span className="text-red-500">*</span>
                                            <span className="text-gray-400 font-normal ml-1">(departure guide)</span>
                                        </label>
                                        <select
                                            value={transferForm.fromGuideId}
                                            onChange={(e) => {
                                                setTransferForm({ ...transferForm, fromGuideId: e.target.value, toGuideId: '' });
                                                setShowConfirmation(false);
                                                setError('');
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        >
                                            <option value="">— Select guide to transfer FROM —</option>
                                            {guides.map(guide => (
                                                <option key={guide.id} value={guide.id} className="text-gray-900">
                                                    {guide.name || guide.email}
                                                    {guide.studentCount > 0 ? ` (${guide.studentCount} student${guide.studentCount !== 1 ? 's' : ''})` : ' (no students)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Arrow visual */}
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="h-px w-8 bg-gray-300"></div>
                                            <FiArrowRight size={20} />
                                            <div className="h-px w-8 bg-gray-300"></div>
                                        </div>
                                    </div>

                                    {/* To Guide */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            To Guide <span className="text-red-500">*</span>
                                            <span className="text-gray-400 font-normal ml-1">(receiving guide)</span>
                                        </label>
                                        <select
                                            value={transferForm.toGuideId}
                                            onChange={(e) => {
                                                setTransferForm({ ...transferForm, toGuideId: e.target.value });
                                                setShowConfirmation(false);
                                                setError('');
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            required
                                            disabled={!transferForm.fromGuideId}
                                        >
                                            <option value="">— Select guide to transfer TO —</option>
                                            {guides
                                                .filter(g => g.id !== transferForm.fromGuideId)
                                                .map(guide => (
                                                    <option key={guide.id} value={guide.id} className="text-gray-900">
                                                        {guide.name || guide.email}
                                                        {guide.studentCount > 0 ? ` (currently ${guide.studentCount} student${guide.studentCount !== 1 ? 's' : ''})` : ''}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Warning note */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <FiAlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                                            <p className="text-xs text-amber-800">
                                                <strong>This action cannot be undone easily.</strong> All students listed on the right will have their primary guide changed permanently.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !transferForm.fromGuideId || !transferForm.toGuideId || transferForm.fromGuideId === transferForm.toGuideId}
                                        className="w-full py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FiRefreshCw size={16} />
                                        Preview Transfer
                                    </button>
                                </form>
                            </div>

                            {/* Right: Student Preview Panel */}
                            <div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden h-full min-h-[280px]">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700">
                                            Students to be Transferred
                                            {studentsToTransfer.length > 0 && (
                                                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                    {studentsToTransfer.length}
                                                </span>
                                            )}
                                        </h4>
                                    </div>
                                    <div className="p-4">
                                        {!transferForm.fromGuideId ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                                <FiUsers className="text-gray-300 mb-2" size={32} />
                                                <p className="text-sm text-gray-400">Select a "From Guide" to see their students here</p>
                                            </div>
                                        ) : studentsToTransfer.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                                <FiUser className="text-gray-300 mb-2" size={32} />
                                                <p className="text-sm text-gray-500">This guide has no students assigned.</p>
                                                <p className="text-xs text-gray-400 mt-1">Nothing to transfer.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                                {studentsToTransfer.map((student, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-100">
                                                        <div className="h-8 w-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <FiUser className="text-orange-700" size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Dialog */}
                        {showConfirmation && fromGuide && toGuide && (
                            <div className="mt-6 bg-white border-2 border-orange-300 rounded-xl p-5 shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <FiAlertTriangle className="text-orange-500 flex-shrink-0" size={22} />
                                    <div>
                                        <h4 className="font-bold text-gray-800">Confirm Batch Transfer</h4>
                                        <p className="text-sm text-gray-600">
                                            Transfer <strong>{studentsToTransfer.length} student(s)</strong> from{' '}
                                            <strong className="text-orange-700">{fromGuide.name}</strong> to{' '}
                                            <strong className="text-green-700">{toGuide.name}</strong>?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmTransfer}
                                        disabled={loading}
                                        className="flex-1 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Transferring...' : `Yes, Transfer ${studentsToTransfer.length} Student(s)`}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        disabled={loading}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
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
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-700 tracking-tight mb-2">Guide Management</h1>
                    <p className="text-sm text-gray-500">Manage guides, co-guides, and batch assignments</p>
                </div>

                {/* Tab Buttons */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setError('');
                                        setSuccess('');
                                        setShowConfirmation(false);
                                        setTransferComplete(null);
                                    }}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? tab.id === 'batch-transfer'
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-blue-600 text-white'
                                            : tab.id === 'batch-transfer'
                                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                >
                                    <IconComponent size={16} />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                    {/* Global error/success for non-batch-transfer tabs */}
                    {activeTab !== 'batch-transfer' && activeTab !== 'add-guide' && activeTab !== 'add-co-guide' && error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}
                    {activeTab !== 'batch-transfer' && activeTab !== 'add-guide' && activeTab !== 'add-co-guide' && success && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    )}
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuideManagementPage;
