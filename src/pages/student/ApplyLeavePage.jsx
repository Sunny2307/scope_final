// src/pages/student/ApplyLeavePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook
import ApplyLeaveContent from '../../components/student/ApplyLeaveContent';

// 2. Remove the prop from the function signature
export default function ApplyLeavePage() {
    const navigate = useNavigate(); // 3. Get the navigate function

    // 4. Create a handler that navigates back
    const handleBackToDashboard = () => {
        navigate(-1); // Navigates to the previous page in history
    };

    // 5. Pass the new handler to the content component
    return <ApplyLeaveContent onBackToDashboard={handleBackToDashboard} />;
}