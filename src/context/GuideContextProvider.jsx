import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { GuideContext } from './GuideContext';

export default function GuideContextProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/', { replace: true });
  };

  // First useEffect: Verify token and set basic user data
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('GuideContextProvider: No token found, redirecting to login');
          navigate('/', { replace: true });
          return;
        }

        console.log('GuideContextProvider: Verifying token');
        const response = await api.get('/api/auth/verify-token', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('GuideContextProvider: Token verification response:', response.data);
        
        // Check if user is actually a guide
        const userRole = localStorage.getItem('userRole');
        const userData = localStorage.getItem('userData');
        
        if (userRole !== 'GUIDE') {
          console.log('GuideContextProvider: User is not a guide, redirecting to login');
          handleLogout();
          return;
        }

        // Set user data from localStorage or response
        let guideUser = null;
        if (userData) {
          guideUser = JSON.parse(userData);
        } else {
          guideUser = {
            email: response.data.email,
            name: 'Guide User',
            role: 'GUIDE'
          };
        }

        setUser(guideUser);
        console.log('GuideContextProvider: Token verification complete, isLoading: false');
      } catch (error) {
        console.error('GuideContextProvider: Token verification failed:', error.response?.data?.error || error.message);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  const contextValue = {
    user,
    isLoading,
    handleLogout,
  };

  return (
    <GuideContext.Provider value={contextValue}>
      {children}
    </GuideContext.Provider>
  );
}
