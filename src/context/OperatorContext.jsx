import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const OperatorContext = createContext();

export const useOperator = () => {
    const context = useContext(OperatorContext);
    if (!context) {
        throw new Error('useOperator must be used within an OperatorContextProvider');
    }
    return context;
};

export const OperatorContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('OperatorContext: Initial useEffect triggered');
        const token = localStorage.getItem('token');
        console.log('OperatorContext: Token found:', !!token);
        
        if (token) {
            verifyToken(token);
        } else {
            console.log('OperatorContext: No token found, setting loading to false');
            setLoading(false);
        }
    }, []);

    // Check for token changes more frequently
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (token && !user) {
                console.log('OperatorContext: Token found, verifying...');
                verifyToken(token);
            }
        };

        // Check immediately
        checkToken();
        
        // Check every 2 seconds
        const interval = setInterval(checkToken, 2000);
        
        return () => clearInterval(interval);
    }, [user]);

    // Check token validity periodically and when user changes
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token) {
                verifyToken(token);
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, [user]);

    const verifyToken = async (token) => {
        try {
            console.log('OperatorContext: Verifying token...');
            const response = await api.get('/api/auth/verify-token', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('OperatorContext: Token verification response:', response.data);
            
            if (response.data.role === 'OPERATOR') {
                console.log('OperatorContext: Setting user as operator');
                setUser(response.data);
            } else {
                console.log('OperatorContext: Access denied - not operator role');
                localStorage.removeItem('token');
                setError('Access denied. Operator role required.');
            }
        } catch (error) {
            console.error('OperatorContext: Token verification failed:', error);
            localStorage.removeItem('token');
            setError('Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.post('/api/auth/login', {
                email,
                password
            });

            if (response.data.role === 'OPERATOR') {
                localStorage.setItem('token', response.data.token);
                setUser(response.data);
                return { success: true };
            } else {
                setError('Access denied. Operator role required.');
                return { success: false, error: 'Access denied. Operator role required.' };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        verifyToken
    };

    return (
        <OperatorContext.Provider value={value}>
            {children}
        </OperatorContext.Provider>
    );
};

export { OperatorContext };

export default OperatorContextProvider;
