// API Configuration
// This file centralizes all API endpoint configuration

// Get API URL from environment variable, fallback to production backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://scope-backend.vercel.app';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Export commonly used endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: 'api/auth/login',
  SIGNUP: 'api/auth/signup',
  VERIFY_TOKEN: 'api/auth/verify-token',
  VERIFY_OTP: 'api/auth/verify-otp',
  SET_PASSWORD: 'api/auth/set-password',
  GENERATE_TOKEN: 'api/auth/generate-token',
  USER_PROFILE: 'api/auth/user-profile',
  
  // Student endpoints
  STUDENT_LEAVE_SUMMARY: 'api/auth/student/leave-summary',
  STUDENT_SUBMIT_LEAVE: 'api/auth/student/submitLeaveApplication',
  STUDENT_SCHOLARSHIPS: 'api/auth/student/scholarships',
  STUDENT_UPLOAD_PHOTO: 'api/auth/student/uploadProfilePhoto',
  STUDENT_SAVE_PROFILE: 'api/auth/student/saveStudentProfile',
  STUDENT_AUTO_LEAVES: 'api/auth/student/auto-generated-leaves',
  STUDENT_ENJOYED_LEAVES: 'api/auth/student/enjoyed-leaves',
  
  // Operator endpoints
  OPERATOR_ALL_STUDENTS: 'api/auth/operator/all-students',
  OPERATOR_PENDING_STUDENTS: 'api/auth/operator/pending-students',
  OPERATOR_APPROVE_REJECT: 'api/auth/operator/approve-reject-student',
  OPERATOR_TOGGLE_STATUS: 'api/auth/operator/toggle-student-status',
  OPERATOR_LEAVE_ACTION: 'api/auth/operator/leave-action',
  OPERATOR_LWP_APPLICATIONS: 'api/auth/operator/lwp-applications',
  OPERATOR_MONTHLY_REPORT: 'api/auth/operator/monthly-report',
  OPERATOR_ALL_GUIDES: 'api/auth/operator/all-guides',
  OPERATOR_ADD_GUIDE: 'api/auth/operator/add-guide',
  OPERATOR_ADD_CO_GUIDE: 'api/auth/operator/add-co-guide',
  OPERATOR_BATCH_TRANSFER: 'api/auth/operator/batch-transfer',
  OPERATOR_UPDATE_STUDENT: 'api/auth/operator/update-student-profile',
  
  // Guide endpoints
  GUIDE_LEAVE_ACTION: 'api/auth/guide/leave-action',
  GUIDE_LEAVE_APPLICATIONS: 'api/auth/guide/leave-applications',
  GUIDE_STUDENTS: 'api/auth/guide/students',
  GUIDE_MONTHLY_REPORT: 'api/auth/guide/monthly-report',
  
  // Dean endpoints
  DEAN_STUDENTS: 'api/dean/students',
  DEAN_MONTHLY_REPORT: 'api/dean/monthly-report',
  
  // Excel endpoints
  EXCEL_UPLOAD: 'api/excel/upload',
  EXCEL_HISTORY: 'api/excel/history',
  
  // Common endpoints
  AVAILABLE_GUIDES: 'api/auth/available-guides',
};

// Helper to get upload URL for documents
// Now handles both file paths (legacy) and base64 data URLs (Vercel-compatible)
export const getUploadUrl = (documentPath) => {
  if (!documentPath) return null;
  
  // Check if it's a base64 data URL (starts with "data:")
  if (documentPath.startsWith('data:')) {
    return documentPath; // Return as-is for base64 data URLs
  }
  
  // Legacy file path handling
  const cleanPath = documentPath.startsWith('/') ? documentPath.slice(1) : documentPath;
  return `${API_BASE_URL}/${cleanPath}`;
};

