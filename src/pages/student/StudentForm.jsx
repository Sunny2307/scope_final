import React from 'react';
import StudentFormContextProvider from '../../context/StudentFormContextProvider';
import StudentProfileContent from '../../components/student/form/StudentProfileContent';

/**
 * The main page for creating a student profile.
 * It wraps the entire feature with the StudentFormContextProvider
 * to provide state and logic to all child components.
 */
export default function StudentProfileForm() {
    return (
        <div className="w-screen bg-gray-50 font-sans flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
            <StudentFormContextProvider>
                <StudentProfileContent />
            </StudentFormContextProvider>
        </div>
    );
}
