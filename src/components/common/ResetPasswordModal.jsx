import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const ResetPasswordModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');

        // Validation
        if (!currentPassword) {
            setErrors({ currentPassword: 'Current password is required' });
            return;
        }
        if (!newPassword) {
            setErrors({ newPassword: 'New password is required' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(response.data.message);
            // Clear form and close modal after 2 seconds
            setTimeout(() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage('');
                onClose();
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setMessage('');
        onClose();
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        // Close this modal and navigate to the Forgot Password page
        handleClose();
        navigate('/forgot-password');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex justify-center items-center p-4 backdrop-blur-sm bg-black/10 transition-opacity duration-300"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-800">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${
                                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter current password"
                            />
                            {errors.currentPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="newPassword" className="text-sm font-medium text-gray-800">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${
                                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter new password"
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${
                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Re-enter new password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {message && (
                            <p className={`text-sm text-center mt-2 ${
                                message.includes('successfully') ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {message}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-4 gap-4">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-teal-600 hover:text-teal-700 underline-offset-2 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="flex gap-3 mt-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 text-base font-semibold rounded-lg shadow-sm transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 px-4 py-3 text-base font-semibold rounded-lg shadow-sm transition-colors bg-teal-600 text-white hover:bg-teal-700 ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;


