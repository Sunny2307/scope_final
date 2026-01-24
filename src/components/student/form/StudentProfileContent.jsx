import React, { useContext, useEffect } from "react";
import { StudentFormContext } from "../../../context/StudentFormContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import all the step components
import {
  StepProgressBar,
  PersonalDetails,
  ContactInfo,
  AcademicInfo,
  Documents,
  Review,
} from "./StepComponents";

/**
 * The main content container for the student profile form.
 * It consumes the context and orchestrates the display of steps and navigation.
 */
export default function StudentProfileContent() {
  const {
    currentStep,
    isSubmitted,
    isSubmitting,
    prevStep,
    nextStep,
    handleSubmit,
    message,
  } = useContext(StudentFormContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitted) {
      // Directly redirect to pending approval page without showing success screen
      navigate('/student/pending-approval', { replace: true });
    }
  }, [isSubmitted, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetails />;
      case 2:
        return <ContactInfo />;
      case 3:
        return <AcademicInfo />;
      case 4:
        return <Documents />;
      case 5:
        return <Review />;
      default:
        return <PersonalDetails />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-2 overflow-y-hidden">
        Create Your Student Profile
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Follow the steps to complete your profile.
      </p>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${
          message.includes('already exists') 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-400' 
            : message.includes('error') || message.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          <div className="flex-1">
            {message.includes('already exists') ? (
              <>
                <p className="font-semibold mb-2">Profile Already Submitted</p>
                <p className="text-sm">{message}</p>
                <p className="text-sm mt-2">You will be redirected to your approval status page...</p>
              </>
            ) : (
              message
            )}
          </div>
        </div>
      )}
      
      <StepProgressBar />
      <div className="mt-10">{renderStep()}</div>
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          // Changed: Updated the styling of the "Back" button to match the "Next" button
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
        )}
        {currentStep < 5 && (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center ml-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
        {currentStep === 5 && (
          // Note: The submit button is on the right, so it needs ml-auto to stay there when the back button is present.
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center ${
              currentStep > 1 ? "" : "ml-auto"
            } px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400`}
          >
            {isSubmitting ? "Submitting..." : "Submit Profile"}
          </button>
        )}
      </div>
    </form>
  );
}
