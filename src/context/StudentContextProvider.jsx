import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StudentContext } from './StudentContext';
import StudentFormContextProvider from './StudentFormContextProvider';
import api from '../lib/api';

export default function StudentContextProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Combined useEffect: Token verification and user profile in parallel
  useEffect(() => {
    // First check URL parameters (for signup flow)
    let token = new URLSearchParams(location.search).get('token');
    
    // If no token in URL, check localStorage (for login flow)
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    console.log('StudentContextProvider: Token retrieved:', token ? '[REDACTED]' : 'none');
    
    if (token) {
      setIsLoading(true);
      
      // Store token in localStorage if it came from URL (signup flow)
      if (new URLSearchParams(location.search).get('token')) {
        localStorage.setItem('token', token);
      }
      
      // Fetch token verification and user profile in parallel for faster loading
      Promise.all([
        api.get('/api/auth/verify-token', {
          headers: {Authorization: `Bearer ${token} `},
        }),
        api.get('/api/auth/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])
        .then(([verifyResponse, profileResponse]) => {
          console.log('=== StudentContextProvider: API Response ===');
          console.log('Profile response status:', profileResponse.status);
          console.log('Profile response data:', JSON.stringify(profileResponse.data, null, 2));
          const { email } = verifyResponse.data;
          
          // Set user with complete profile data immediately
          const userData = {
            email,
            ...profileResponse.data
          };
          
          console.log('=== StudentContextProvider: Final User Data ===');
          console.log('userData.department:', userData.department);
          console.log('userData.guide:', userData.guide);
          console.log('userData.coGuide:', userData.coGuide);
          console.log('Full userData:', JSON.stringify(userData, null, 2));
          console.log('=== StudentContextProvider: Setting User ===');
          
          // Check if student is approved - if not, redirect to pending approval page
          if (userData.role === 'STUDENT' && userData.approvalStatus !== 'APPROVED') {
            const approvalStatus = userData.approvalStatus || 'PENDING';
            console.log('Student not approved, redirecting. Status:', approvalStatus);
            navigate('/student/pending-approval', { replace: true });
            return;
          }
          
          setUser(userData);
        })
        .catch(error => {
          console.error('StudentContextProvider: Error:', error.response?.data?.error || error.message);
          setMessage('Failed to verify token. Please log in again.');
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/', { replace: true });
        })
        .finally(() => {
          console.log('StudentContextProvider: Loading complete');
          setIsLoading(false);
        });
    } else {
      console.log('StudentContextProvider: No token found, redirecting to /');
      setMessage('No token provided. Please sign up or log in.');
      setIsLoading(false);
      navigate('/', { replace: true });
    }
  }, [navigate, location]);

  const handleLogout = () => {
    console.log('StudentContextProvider: Logging out, clearing user');
    setUser(null);
    localStorage.removeItem('token'); // Clear token on logout
    navigate('/', { replace: true });
  };

  const value = { user, isLoading, handleLogout, message };

  return (
    <StudentContext.Provider value={value}>
      {!isLoading ? (
        user ? (
          <StudentFormContextProvider userEmail={user.email}>
            {children}
          </StudentFormContextProvider>
        ) : (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <p className="text-red-600">{message}</p>
              <a href="/" className="text-blue-600 underline">Go to Login</a>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <p>Loading...</p>
        </div>
      )}
    </StudentContext.Provider>
  );
}