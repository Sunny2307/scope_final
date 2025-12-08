import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FiList, FiUserPlus, FiUsers, FiRefreshCw } from 'react-icons/fi';

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
            // Refresh guides list
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
            // Refresh guides list
            await fetchGuides();
        } catch (err) {
            console.error('Error adding co-guide:', err);
            setError(err.response?.data?.error || 'Failed to add co-guide. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchTransfer = async (e) => {
        e.preventDefault();
        if (!transferForm.fromGuideId || !transferForm.toGuideId) {
            setError('Please select both From Guide and To Guide');
            return;
        }
        if (transferForm.fromGuideId === transferForm.toGuideId) {
            setError('From Guide and To Guide cannot be the same');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/api/auth/operator/batch-transfer', {
                fromGuideId: transferForm.fromGuideId,
                toGuideId: transferForm.toGuideId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(response.data.message || `Successfully transferred ${response.data.transferredCount || 0} students.`);
            setTransferForm({ fromGuideId: '', toGuideId: '' });
            fetchGuides(); // Refresh guide list to update student counts
        } catch (err) {
            console.error('Error transferring students:', err);
            setError(err.response?.data?.error || 'Failed to transfer students.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (error && !loading) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            );
        }

        if (success && !loading) {
            return (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            );
        }

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
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">ID</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">NAME</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">EMAIL</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-600">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guides.map((guide, index) => (
                                    <tr key={guide.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">
                                            {guide.id}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">
                                            {guide.name}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">
                                            {guide.email}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                guide.status === 'Active' 
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
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Guide</h3>
                        <form onSubmit={handleAddGuide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guide Name</label>
                                <input
                                    type="text"
                                    required
                                    value={guideForm.name}
                                    onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Create password for guide"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Guide will use this password to login. They can change it later from the sign-in page.
                                </p>
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
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Co-guide</h3>
                        <form onSubmit={handleAddCoGuide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Co-guide Name</label>
                                <input
                                    type="text"
                                    required
                                    value={coGuideForm.name}
                                    onChange={(e) => setCoGuideForm({ ...coGuideForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Create password for co-guide"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Co-guide will use this password to login. They can change it later from the sign-in page.
                                </p>
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
                return (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Transfer</h3>
                        <p className="text-gray-500 mb-4">Transfer all students from one guide to another guide.</p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                                {success}
                            </div>
                        )}
                        <form onSubmit={handleBatchTransfer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Guide <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={transferForm.fromGuideId}
                                    onChange={(e) => setTransferForm({ ...transferForm, fromGuideId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select guide</option>
                                    {guides.map(guide => (
                                        <option key={guide.id} value={guide.id}>
                                            {guide.name || guide.email} {guide.studentCount > 0 ? `(${guide.studentCount} students)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Guide <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={transferForm.toGuideId}
                                    onChange={(e) => setTransferForm({ ...transferForm, toGuideId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select guide</option>
                                    {guides
                                        .filter(guide => guide.id !== transferForm.fromGuideId)
                                        .map(guide => (
                                            <option key={guide.id} value={guide.id}>
                                                {guide.name || guide.email}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This will transfer all students currently assigned to the "From Guide" to the "To Guide". 
                                    The new guide will manage all transferred students.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !transferForm.fromGuideId || !transferForm.toGuideId || transferForm.fromGuideId === transferForm.toGuideId}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Transferring...' : 'Transfer All Students'}
                            </button>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

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
            `}</style>
            <div className="p-4 md:p-6 h-full flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-700 tracking-tight mb-2">Guide Management</h1>
                    <p className="text-sm text-gray-500">Manage guides, co-guides, and batch assignments</p>
                </div>

                {/* Tab Buttons */}
                <div className="mb-4">
                    <div className="flex space-x-2">
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
                                    }}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-600 text-white'
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

                {/* Content Area - Scrollable Container */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuideManagementPage;
