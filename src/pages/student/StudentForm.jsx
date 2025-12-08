import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import StudentFormContextProvider from '../../context/StudentFormContextProvider';
import StudentProfileContent from '../../components/student/form/StudentProfileContent';

/**
 * The main page for creating a student profile.
 * It wraps the entire feature with the StudentFormContextProvider
 * to provide state and logic to all child components.
 */
export default function StudentProfileForm() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkProfileExists = async () => {
            try {
                // Check URL params first (for signup flow), then localStorage (for login flow)
                let token = new URLSearchParams(window.location.search).get('token');
                if (!token) {
                    token = localStorage.getItem('token');
                }

                if (!token) {
                    navigate('/', { replace: true });
                    return;
                }

                // Verify token and get user profile
                const [verifyResponse, profileResponse] = await Promise.all([
                    api.get('/api/auth/verify-token', {
                        headers: { Authorization: `Bearer ${token} `},
                    }),
                    api.get('/api/auth/user-profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => null) // If profile doesn't exist, this will fail
                ]);

                const email = verifyResponse.data.email;
                
                // If profile exists, redirect based on approval status
                if (profileResponse && profileResponse.data && profileResponse.data.profile) {
                    const approvalStatus = profileResponse.data.approvalStatus || 'PENDING';
                    
                    if (approvalStatus === 'APPROVED') {
                        navigate('/student/dashboard', { replace: true });
                    } else {
                        navigate('/student/pending-approval', { replace: true });
                    }
                    return;
                }

                // Profile doesn't exist, allow form to show
                setIsChecking(false);
            } catch (error) {
                // If error getting profile, assume profile doesn't exist yet
                console.log('Profile check:', error.response?.status === 404 ? 'Profile not found, showing form' : 'Error checking profile');
                setIsChecking(false);
            }
        };

        checkProfileExists();
    }, [navigate]);

    if (isChecking) {
        return (
            <div className="w-screen bg-gray-50 font-sans flex items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen bg-gray-50 font-sans flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
            <StudentFormContextProvider>
                <StudentProfileContent />
            </StudentFormContextProvider>
        </div>
    );
}
