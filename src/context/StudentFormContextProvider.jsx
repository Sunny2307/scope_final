import React, { useState, useEffect } from 'react';
import { StudentFormContext } from './StudentFormContext';
import api from '../lib/api';


/**
 * Provides all state and logic for the multi-step student profile form.
 * It manages form data, step navigation, validation, and submission.
 */
export default function StudentFormContextProvider({ children, userEmail: propUserEmail }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        studentId: '', // Removed automatic extraction, now user-entered (mapped to ugcId)
        employeeId: '', // Added: Employee ID field
        studentName: '',
        institute: 'PDPIAS',
        admissionDate: '',
        registrationDate: '',
        admissionYear: '',
        currentSemester: '',
        gender: '',
        birthDate: '',
        admissionCastCategory: '',
        actualCastCategory: '',
        nationality: 'Indian',
        profilePhoto: null,
        localAddress: '',
        permanentAddress: '',
        country: 'India',
        mobileNo: '',
        guardianMobileNo: '',
        guardianEmail: '',
        personalEmail: '',
        institutionalEmail: '',
        isHandicapped: false,
        disability: '',
        belongsToSamaj: false,
        hostelNameAddress: '',
        nameOfGuide: '',
        guideId: '',
        coGuideId: '',
        ugcId: '', // Use ugcId to store the manual student ID
        scholarshipAmount: '',
        contingencyAmount: '',
        scholarshipType: '',
        aadhaarNumber: '',
        pancardNumber: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [message, setMessage] = useState('');
    const [userEmail, setUserEmail] = useState(propUserEmail || '');
    const [progressLoadedEmail, setProgressLoadedEmail] = useState(null);
    const [isProgressReady, setIsProgressReady] = useState(false);

    // Update userEmail when propUserEmail changes
    useEffect(() => {
        if (propUserEmail && propUserEmail !== userEmail) {
            setUserEmail(propUserEmail);
        }
    }, [propUserEmail]);

    useEffect(() => {
        // Fetch userEmail from token if not provided as prop
        const fetchUserEmail = async () => {
            // Check URL params first (for signup flow), then localStorage (for login flow)
            let token = new URLSearchParams(window.location.search).get('token');
            if (!token) {
                token = localStorage.getItem('token');
            }
            
            if (!userEmail && token) {
                try {
                    const response = await api.get('/api/auth/verify-token', {
                        headers: { Authorization: `Bearer ${token} `},
                    });
                    const email = response.data.email;
                    setUserEmail(email);
                    
                    // Auto-populate student ID from email (part before @) in capital format
                    const studentId = email.split('@')[0].toUpperCase();
                    setFormData(prev => ({
                        ...prev,
                        studentId: studentId,
                        institutionalEmail: email
                    }));
                } catch (error) {
                    console.error('Failed to fetch user email:', error);
                }
            }
        };
        fetchUserEmail();
    }, [userEmail]);

    // Ensure institutionalEmail is set when userEmail is available (from prop or token)
    // This runs after progress loads to ensure institutionalEmail is always set
    useEffect(() => {
        if (userEmail && isProgressReady) {
            setFormData(prev => {
                // Always ensure institutionalEmail matches userEmail, especially after progress loads
                if (!prev.institutionalEmail || prev.institutionalEmail !== userEmail) {
                    // Auto-populate student ID from email (part before @) in capital format if not already set
                    const studentId = userEmail.split('@')[0].toUpperCase();
                    return {
                        ...prev,
                        institutionalEmail: userEmail,
                        // Only set studentId if it's empty
                        ...(prev.studentId ? {} : { studentId: studentId })
                    };
                }
                return prev;
            });
        }
    }, [userEmail, isProgressReady]);

    // Load saved progress once we know the user email
    useEffect(() => {
        if (!userEmail) return;

        if (progressLoadedEmail === userEmail && isProgressReady) {
            return;
        }

        const storageKey = `studentFormProgress:${userEmail}`;
        try {
            const savedProgress = localStorage.getItem(storageKey);
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                if (parsed.formData) {
                    setFormData(prev => {
                        // Always use userEmail for institutionalEmail, never use empty value from saved progress
                        const savedInstitutionalEmail = parsed.formData.institutionalEmail;
                        // Use saved email only if it's valid and matches userEmail, otherwise use userEmail
                        const finalInstitutionalEmail = (savedInstitutionalEmail && savedInstitutionalEmail === userEmail) 
                            ? savedInstitutionalEmail 
                            : userEmail;
                        
                        return {
                            ...prev,
                            ...parsed.formData,
                            // Always ensure institutionalEmail is set to userEmail
                            institutionalEmail: finalInstitutionalEmail
                        };
                    });
                }
                if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 5) {
                    setCurrentStep(parsed.currentStep);
                }
            } else {
                // If no saved progress, ensure institutionalEmail is set
                setFormData(prev => {
                    if (!prev.institutionalEmail || prev.institutionalEmail !== userEmail) {
                        return {
                            ...prev,
                            institutionalEmail: userEmail
                        };
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Failed to load saved student form progress:', error);
            // Even if loading fails, ensure institutionalEmail is set
            setFormData(prev => {
                if (!prev.institutionalEmail || prev.institutionalEmail !== userEmail) {
                    return {
                        ...prev,
                        institutionalEmail: userEmail
                    };
                }
                return prev;
            });
        } finally {
            setProgressLoadedEmail(userEmail);
            setIsProgressReady(true);
        }
    }, [userEmail, progressLoadedEmail, isProgressReady]);

    // Ensure progress ready flag resets when switching between users
    useEffect(() => {
        if (!userEmail) return;
        if (progressLoadedEmail !== userEmail) {
            setIsProgressReady(false);
        }
    }, [userEmail, progressLoadedEmail]);

    // Persist progress to localStorage whenever data changes
    useEffect(() => {
        if (!userEmail || !isProgressReady || isSubmitted) return;

        const storageKey = `studentFormProgress:${userEmail}`;
        const { profilePhoto, ...persistableFormData } = formData;

        try {
            localStorage.setItem(storageKey, JSON.stringify({
                currentStep,
                formData: persistableFormData,
            }));
        } catch (error) {
            console.error('Failed to save student form progress:', error);
        }
    }, [formData, currentStep, userEmail, isProgressReady, isSubmitted]);

    // Clear stored progress once submission completes
    useEffect(() => {
        if (isSubmitted && userEmail) {
            const storageKey = `studentFormProgress:${userEmail}`;
            localStorage.removeItem(storageKey);
            localStorage.removeItem('needsProfileCompletion');
        }
    }, [isSubmitted, userEmail]);


    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handlePhotoUpload = async (file) => {
        if (!file) return;
        
        try {
            // Check URL params first (for signup flow), then localStorage (for login flow)
            let token = new URLSearchParams(window.location.search).get('token');
            if (!token) {
                token = localStorage.getItem('token');
            }
            
            const formData = new FormData();
            formData.append('profilePhoto', file);
            
            const response = await api.post('/api/auth/student/uploadProfilePhoto', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Update form data with photo URL (base64 data URL)
            setFormData(prev => ({
                ...prev,
                profilePhotoUrl: response.data.photoUrl,
                profilePhoto: file // Keep the file reference for form submission
            }));
            
            return response.data.photoUrl;
        } catch (error) {
            console.error('Failed to upload profile photo:', error);
            throw error;
        }
    };


    const validateStep = () => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!formData.studentId) newErrors.studentId = 'Student ID is required';
            if (!formData.studentName) newErrors.studentName = 'Student name is required';
            if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
            if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
            if (!formData.registrationDate) newErrors.registrationDate = 'Registration date is required';
            if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.admissionCastCategory) newErrors.admissionCastCategory = 'Admission cast category is required';
            if (!formData.actualCastCategory) newErrors.actualCastCategory = 'Actual cast category is required';
            if (!formData.nationality) newErrors.nationality = 'Nationality is required';
        } else if (currentStep === 2) {
            if (!formData.localAddress) newErrors.localAddress = 'Local address is required';
            if (!formData.permanentAddress) newErrors.permanentAddress = 'Permanent address is required';
            if (!formData.mobileNo) newErrors.mobileNo = 'Mobile number is required';
            if (!/^\d{10}$/.test(formData.mobileNo)) newErrors.mobileNo = 'Mobile number must be 10 digits';
            if (!formData.personalEmail) newErrors.personalEmail = 'Personal email is required';
            if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) newErrors.personalEmail = 'Personal email is invalid';
            if (!formData.institutionalEmail) newErrors.institutionalEmail = 'Institutional email is required';
            if (!/\S+@\S+\.\S+/.test(formData.institutionalEmail)) newErrors.institutionalEmail = 'Institutional email is invalid';
            if (!formData.country) newErrors.country = 'Country is required';
        } else if (currentStep === 3) {
            if (!formData.guideId) newErrors.guideId = 'Guide selection is required';
        } else if (currentStep === 4) {
            if (!formData.aadhaarNumber) newErrors.aadhaarNumber = 'Aadhaar Number is required';
            if (!formData.pancardNumber) newErrors.pancardNumber = 'Pancard Number is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
            }
        }
    };


    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep()) {
            setIsSubmitting(true);
            setMessage('');
            if (!userEmail) {
                setMessage('User email not available. Please log in again.');
                setIsSubmitting(false);
                return;
            }
            try {
                // Check URL params first (for signup flow), then localStorage (for login flow)
                let token = new URLSearchParams(window.location.search).get('token');
                if (!token) {
                    token = localStorage.getItem('token');
                }
                // Create submitData without the File object to avoid serialization issues
                const submitData = {
                    userEmail,
                    studentId: formData.studentId,
                    employeeId: formData.employeeId, // Added: Employee ID field
                    studentName: formData.studentName,
                    admissionDate: formData.admissionDate,
                    registrationDate: formData.registrationDate,
                    currentSemester: formData.currentSemester,
                    gender: formData.gender,
                    birthDate: formData.birthDate,
                    admissionCastCategory: formData.admissionCastCategory,
                    actualCastCategory: formData.actualCastCategory,
                    nationality: formData.nationality,
                    localAddress: formData.localAddress,
                    permanentAddress: formData.permanentAddress,
                    country: formData.country,
                    mobileNo: formData.mobileNo,
                    guardianMobileNo: formData.guardianMobileNo,
                    guardianEmail: formData.guardianEmail,
                    personalEmail: formData.personalEmail,
                    institutionalEmail: formData.institutionalEmail,
                    isHandicapped: formData.isHandicapped,
                    disability: formData.disability,
                    photoUploaded: !!formData.profilePhoto, // Send boolean flag instead of file
                    belongsToSamaj: formData.belongsToSamaj,
                    hostelNameAndAddress: formData.hostelNameAddress,
                    aadhaarNumber: formData.aadhaarNumber,
                    pancardNumber: formData.pancardNumber,
                    nameOfGuide: formData.nameOfGuide, // Keep for backward compatibility
                    guideId: formData.guideId,
                    coGuideId: formData.coGuideId,
                    scholarshipAmount: formData.scholarshipAmount,
                    contingencyAmount: formData.contingencyAmount,
                    scholarshipType: formData.scholarshipType,
                    ugcId: formData.studentId,
                };
                const response = await api.post('/api/auth/student/saveStudentProfile', submitData, {
                    headers: { Authorization: `Bearer ${token} `}
                });
                setMessage(response.data.message);
                // Update localStorage to reflect that profile is submitted and pending approval
                localStorage.setItem('needsProfileCompletion', 'false');
                localStorage.setItem('approvalStatus', 'PENDING');
                setIsSubmitted(true);
            } catch (error) {
                setMessage(error.response?.data?.error || 'An error occurred during submission');
                console.error('Submission error:', error.response?.data || error.message); // Enhanced logging
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    const ctxValue = {
        currentStep,
        formData,
        errors,
        isSubmitting,
        isSubmitted,
        handleChange,
        handlePhotoUpload,
        nextStep,
        prevStep,
        handleSubmit,
        userEmail,
        message,
    };

    return (
        <StudentFormContext.Provider value={ctxValue}>
            {children}
        </StudentFormContext.Provider>
    );
}