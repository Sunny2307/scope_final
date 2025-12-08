// src/components/layout/GuideDashboardHeader.jsx

import React, { useContext, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { GuideContext } from '../../context/GuideContext';
import ResetPasswordModal from '../common/ResetPasswordModal';

const scopeLogo = '/logo/SCOPE_LOGO.svg';

const GuideDashboardHeader = () => {
    const { handleLogout, user } = useContext(GuideContext);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

    return (
        <>
        <header className="bg-white px-6 flex justify-between items-center z-20 shrink-0 min-h-0 border-b border-gray-200 h-16" style={{ height: '64px' }}>
            <div className="flex items-center">
                <img 
                    src={scopeLogo} 
                    alt="Logo" 
                    style={{ height: '200px', width: 'auto' }} 
                />
            </div>
                                    <div className="flex items-center gap-4">
                            <div
                                className="px-5 py-2 text-base font-semibold rounded-full shadow-sm bg-cyan-50 text-cyan-900 border border-cyan-400"
                            >
                                Guide Dashboard
                            </div>
                
                <button 
                    onClick={() => setIsResetPasswordOpen(true)}
                    className="px-4 py-2 text-base font-semibold rounded-lg shadow-sm transition-colors
                               bg-gray-100 text-gray-900
                               hover:bg-gray-200
                               active:bg-gray-300
                               focus:outline-none"
                >
                    Reset Password
                </button>
                
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg shadow-sm transition-colors
                               bg-red-100 text-red-900
                               hover:bg-red-200
                               active:bg-red-300
                               focus:outline-none"
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </header>
        <ResetPasswordModal 
            isOpen={isResetPasswordOpen} 
            onClose={() => setIsResetPasswordOpen(false)} 
        />
        </>
    );
};

export default GuideDashboardHeader;