import { createContext } from 'react';

/**
 * Creates the context for the multi-step student profile form.
 * This defines the blueprint for the data and functions that will be 
 * available to all form components.
 */
export const StudentFormContext = createContext({
    currentStep: 1,
    formData: {},
    errors: {},
    isSubmitting: false,
    isSubmitted: false,
    handleChange: () => {},
    handlePhotoUpload: () => {},
    nextStep: () => {},
    prevStep: () => {},
    handleSubmit: () => {},
    userEmail: '',
});
