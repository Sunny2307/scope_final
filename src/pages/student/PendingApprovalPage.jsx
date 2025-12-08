import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
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

        const response = await api.get('/api/auth/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const status = response.data?.approvalStatus || 'PENDING';
        setApprovalStatus(status);

        // If approved, redirect to dashboard
        if (status === 'APPROVED') {
          navigate('/student/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkApprovalStatus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('needsProfileCompletion');
    localStorage.removeItem('approvalStatus');
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-gray-50 font-sans flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isRejected = approvalStatus === 'REJECTED';

  return (
    <div className="w-screen h-screen bg-gray-50 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 ${isRejected ? 'bg-red-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
            {isRejected ? (
              <XCircle className="w-10 h-10 text-red-600" />
            ) : (
              <Clock className="w-10 h-10 text-yellow-600" />
            )}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isRejected ? 'Your Profile Has Been Rejected' : 'Your Approval is Pending'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isRejected 
            ? 'Unfortunately, your profile has been rejected. Please contact the administrator for more information.'
            : 'Your profile has been submitted successfully. We are currently reviewing your application. You will be notified once an operator approves your profile.'}
        </p>
        
        <div className={`${isRejected ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
          <p className={`text-sm ${isRejected ? 'text-red-800' : 'text-yellow-800'}`}>
            <strong>Status:</strong> {isRejected ? 'Rejected' : 'Pending Review'}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

