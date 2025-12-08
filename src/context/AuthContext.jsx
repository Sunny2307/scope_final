import { createContext } from "react";

/**
 * Creates the authentication context.
 * This defines the default shape of the data that will be available
 * to all components wrapped by the AuthContextProvider.
 */
export const AuthContext = createContext({
    // Login State
    loginCredentials: { email: '', password: '' },
    setLoginCredentials: () => {},
    
    // SignUp State
    signUpCredentials: { email: '', password: '' },
    setSignUpCredentials: () => {},
    otp: ['', '', '', ''],
    setOtp: () => {},
    otpSent: false,

    // Common State
    isLoading: false,
    message: '',
    errors: { email: '', password: '' },
    touched: { email: false, password: false },
    setErrors: () => {},
    setTouched: () => {},
    
    // Handler Functions
    handleLogin: async () => {},
    handleSendOtp: async () => {},
    handleSignUp: async () => {},

    // OTP input specific handlers
    handleOtpChange: () => {},
    handleOtpKeyDown: () => {},
    
    // Forgot Password State
    forgotPasswordEmail: '',
    setForgotPasswordEmail: () => {},
    forgotPasswordOtp: ['', '', '', ''],
    setForgotPasswordOtp: () => {},
    forgotPasswordOtpSent: false,
    forgotPasswordOtpVerified: false,
    forgotPasswordCredentials: { newPassword: '', confirmPassword: '' },
    setForgotPasswordCredentials: () => {},
    forgotPasswordOtpRefs: [],
    handleForgotPasswordSendOtp: async () => {},
    handleVerifyForgotPasswordOtp: async () => {},
    handleResetPassword: async () => {},
    handleForgotPasswordOtpChange: () => {},
    handleForgotPasswordOtpKeyDown: () => {},
});
