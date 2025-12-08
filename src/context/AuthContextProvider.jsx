import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from "./AuthContext";

export default function AuthContextProvider({ children }) {
  const navigate = useNavigate();

  // --- State and Refs ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', studentId: '' });
  const [touched, setTouched] = useState({ email: false, password: false, studentId: false });
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [signUpCredentials, setSignUpCredentials] = useState({ email: '', password: '', studentId: '' });

  // Auto-extract student ID from email when email changes
  useEffect(() => {
    if (signUpCredentials.email && signUpCredentials.email.includes('@charusat.edu.in')) {
      const studentId = signUpCredentials.email.split('@charusat.edu.in')[0].toUpperCase();
      setSignUpCredentials(prev => ({ ...prev, studentId }));
    } else if (signUpCredentials.email && !signUpCredentials.email.includes('@charusat.edu.in')) {
      // Clear student ID if email doesn't contain @charusat.edu.in
      setSignUpCredentials(prev => ({ ...prev, studentId: '' }));
    }
  }, [signUpCredentials.email]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef([]);
  
  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState(['', '', '', '']);
  const [forgotPasswordOtpSent, setForgotPasswordOtpSent] = useState(false);
  const [forgotPasswordOtpVerified, setForgotPasswordOtpVerified] = useState(false);
  const [forgotPasswordCredentials, setForgotPasswordCredentials] = useState({ newPassword: '', confirmPassword: '' });
  const forgotPasswordOtpRefs = useRef([]);

  // --- Login Success State ---
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // --- Navigation Effect ---
  useEffect(() => {
    console.log('useEffect triggered, loginSuccess:', loginSuccess);
    if (loginSuccess && !hasNavigated) {
      const userRole = localStorage.getItem('userRole');
      const needsProfileCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
      console.log('User role:', userRole);
      
      if (userRole === 'GUIDE') {
        console.log('Navigating to /guide/dashboard');
        navigate('/guide/dashboard', { replace: true });
      } else if (userRole === 'OPERATOR') {
        console.log('Navigating to /operator/dashboard');
        navigate('/operator/dashboard', { replace: true });
      } else if (userRole === 'DEAN') {
        console.log('Navigating to /dean/dashboard');
        navigate('/dean/dashboard', { replace: true });
      } else {
        // Student login flow
        if (needsProfileCompletion) {
          console.log('Navigating to /student/StudentForm for incomplete profile');
          navigate('/student/StudentForm', { replace: true });
        } else {
          // Profile is complete, check approval status
          const approvalStatus = localStorage.getItem('approvalStatus');
          if (approvalStatus === 'APPROVED') {
            console.log('Navigating to /student/dashboard - approved');
            navigate('/student/dashboard', { replace: true });
          } else if (approvalStatus === 'PENDING' || !approvalStatus) {
            console.log('Navigating to /student/pending-approval - pending');
            navigate('/student/pending-approval', { replace: true });
          } else {
            // REJECTED or other status
            console.log('Navigating to /student/pending-approval - rejected');
            navigate('/student/pending-approval', { replace: true });
          }
        }
      }
      
      setHasNavigated(true);
      
      // Delay reset to ensure navigation completes
      setTimeout(() => {
        setLoginSuccess(false);
        setHasNavigated(false);
        console.log('loginSuccess reset to false');
      }, 1000);
    } else {
      console.log("-> Condition NOT met. Not navigating.");
    }
  }, [loginSuccess, navigate, hasNavigated]);

  // --- Validation Logic ---
  // Validate email for signup (requires @charusat.edu.in)
  const validateEmailForSignup = (email) => {
    console.log('Validating email for signup:', email);
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!email.endsWith('@charusat.edu.in')) {
      setErrors(prev => ({ ...prev, email: 'Please use a valid @charusat.edu.in email address' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  // Validate email for login (no domain restriction)
  const validateEmailForLogin = (email) => {
    console.log('Validating email for login:', email);
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (password) => {
    console.log('Validating password:', password ? '[REDACTED]' : 'empty');
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  // --- Login Handler ---
  const handleLogin = async () => {
    console.log('handleLogin called with credentials:', {
      email: loginCredentials.email,
      password: loginCredentials.password ? '[REDACTED]' : 'empty',
    });
    setTouched({ email: true, password: true });
    
    // Special validation for admin, operator, and dean users
    const isAdminLogin = loginCredentials.email === 'admin';
    const isOperatorLogin = loginCredentials.email === 'operator';
    const isDeanLogin = loginCredentials.email === 'dean' || loginCredentials.email === 'dean@charusat.edu.in';
    const shouldValidateEmail = !isAdminLogin && !isOperatorLogin && !isDeanLogin; // Skip email validation for admin, operator, and dean
    
    if ((shouldValidateEmail ? validateEmailForLogin(loginCredentials.email) : true) && validatePassword(loginCredentials.password)) {
      console.log('Validation passed, sending login request');
      setIsLoading(true);
      try {
        const response = await api.post('/api/auth/login', loginCredentials);
        console.log('Login response:', response.data);
        if (response.data && response.data.token) {
          console.log('Token received:', response.data.token);
          localStorage.setItem('token', response.data.token);
          
          // Store user role for navigation
          if (response.data.role) {
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
          }

          if (typeof response.data.needsProfileCompletion !== 'undefined') {
            localStorage.setItem('needsProfileCompletion', response.data.needsProfileCompletion ? 'true' : 'false');
          } else {
            localStorage.removeItem('needsProfileCompletion');
          }
          
          // Store approval status for students
          if (response.data.approvalStatus) {
            localStorage.setItem('approvalStatus', response.data.approvalStatus);
          } else {
            localStorage.removeItem('approvalStatus');
          }
          
          // Small delay to ensure localStorage is updated before navigation
          setTimeout(() => {
            setLoginSuccess(true);
          }, 100);
        } else {
          console.log('No token in response');
          setMessage('Login response missing token');
        }
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred during login');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Validation failed');
    }
  };

  // Validate student ID (auto-extracted from email)
  const validateStudentId = (email) => {
    if (!email || !email.includes('@charusat.edu.in')) {
      // Student ID validation is handled by email validation
      return true;
    }
    const studentId = email.split('@charusat.edu.in')[0];
    if (!studentId || studentId.trim() === '') {
      setErrors(prev => ({ ...prev, studentId: 'Student ID could not be extracted from email' }));
      return false;
    }
    setErrors(prev => ({ ...prev, studentId: '' }));
    return true;
  };

  // --- Send OTP Handler ---
  const handleSendOtp = async () => {
    console.log('handleSendOtp called with email:', signUpCredentials.email);
    setTouched(prev => ({ ...prev, email: true }));
    // Extract student ID from email
    const studentId = signUpCredentials.email.includes('@charusat.edu.in') 
      ? signUpCredentials.email.split('@charusat.edu.in')[0].toUpperCase().trim()
      : '';
    
    if (validateEmailForSignup(signUpCredentials.email) && validateStudentId(signUpCredentials.email)) {
      setIsLoading(true);
      try {
        const response = await api.post('/api/auth/signup', { 
          email: signUpCredentials.email,
          studentId: studentId
        });
        console.log('Send OTP response:', response.data);
        setMessage(response.data.message);
        setOtpSent(true);
      } catch (error) {
        console.error('Send OTP error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred while sending OTP');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Sign Up Handler ---
  const handleSignUp = async () => {
    console.log('handleSignUp called with credentials:', {
      email: signUpCredentials.email,
      otp: otp.join(''),
    });
    setTouched({ email: true, password: true });
    if (validateEmailForSignup(signUpCredentials.email) && validatePassword(signUpCredentials.password)) {
      setIsLoading(true);
      try {
        const fullOtp = otp.join('');
        const verifyResponse = await api.post('/api/auth/verify-otp', { email: signUpCredentials.email, otp: fullOtp });
        console.log('Verify OTP response:', verifyResponse.data);
        const setPasswordResponse = await api.post('/api/auth/set-password', signUpCredentials);
        console.log('Set password response:', setPasswordResponse.data);
        setMessage(setPasswordResponse.data.message);
        const tokenResponse = await api.post('/api/auth/generate-token', { email: signUpCredentials.email });
        console.log('Generate token response:', tokenResponse.data);
        const token = tokenResponse.data.token;
        localStorage.setItem('token', token);
        console.log('Navigating to /student/StudentForm with token:', token);
        navigate(`/student/StudentForm?token=${token}`, { replace: true });
        setSignUpCredentials({ email: '', password: '', studentId: '' });
        setOtp(['', '', '', '']);
        setOtpSent(false);
      } catch (error) {
        console.error('Sign up error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred during signup');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    console.log(`handleOtpChange called for index ${index} with value: ${value}`);
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    console.log(`handleOtpKeyDown called for index ${index} with key: ${e.key}`);
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    if (e.key === 'ArrowRight' && index < 3) otpRefs.current[index + 1].focus();
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1].focus();
  };

  // --- Forgot Password Handlers ---
  const handleForgotPasswordSendOtp = async () => {
    console.log('handleForgotPasswordSendOtp called with email:', forgotPasswordEmail);
    setTouched(prev => ({ ...prev, email: true }));
    
    if (validateEmailForLogin(forgotPasswordEmail)) {
      setIsLoading(true);
      try {
        const response = await api.post('/api/auth/forgot-password', { 
          email: forgotPasswordEmail
        });
        console.log('Forgot password OTP response:', response.data);
        setMessage(response.data.message);
        setForgotPasswordOtpSent(true);
      } catch (error) {
        console.error('Forgot password send OTP error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred while sending OTP');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    console.log('handleVerifyForgotPasswordOtp called');
    const fullOtp = forgotPasswordOtp.join('');
    if (!fullOtp || fullOtp.length !== 4) {
      setMessage('Please enter the complete OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/verify-forgot-password-otp', { 
        email: forgotPasswordEmail,
        otp: fullOtp
      });
      console.log('Verify forgot password OTP response:', response.data);
      setMessage(response.data.message);
      setForgotPasswordOtpVerified(true);
    } catch (error) {
      console.error('Verify forgot password OTP error:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'An error occurred while verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    console.log('handleResetPassword called');
    setTouched(prev => ({ ...prev, password: true }));
    
    if (!forgotPasswordCredentials.newPassword) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    if (forgotPasswordCredentials.newPassword !== forgotPasswordCredentials.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (validatePassword(forgotPasswordCredentials.newPassword)) {
      setIsLoading(true);
      try {
        const fullOtp = forgotPasswordOtp.join('');
        const response = await api.post('/api/auth/reset-password', { 
          email: forgotPasswordEmail,
          otp: fullOtp,
          password: forgotPasswordCredentials.newPassword
        });
        console.log('Reset password response:', response.data);
        setMessage(response.data.message);
        // Reset state and navigate to login
        setTimeout(() => {
          setForgotPasswordEmail('');
          setForgotPasswordOtp(['', '', '', '']);
          setForgotPasswordOtpSent(false);
          setForgotPasswordOtpVerified(false);
          setForgotPasswordCredentials({ newPassword: '', confirmPassword: '' });
          setMessage('');
          navigate('/', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Reset password error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred while resetting password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPasswordOtpChange = (index, value) => {
    console.log(`handleForgotPasswordOtpChange called for index ${index} with value: ${value}`);
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...forgotPasswordOtp];
      newOtp[index] = value;
      setForgotPasswordOtp(newOtp);
      if (value && index < 3) forgotPasswordOtpRefs.current[index + 1].focus();
    }
  };

  const handleForgotPasswordOtpKeyDown = (index, e) => {
    console.log(`handleForgotPasswordOtpKeyDown called for index ${index} with key: ${e.key}`);
    if (e.key === 'Backspace' && !forgotPasswordOtp[index] && index > 0) forgotPasswordOtpRefs.current[index - 1].focus();
    if (e.key === 'ArrowRight' && index < 3) forgotPasswordOtpRefs.current[index + 1].focus();
    if (e.key === 'ArrowLeft' && index > 0) forgotPasswordOtpRefs.current[index - 1].focus();
  };

  const ctxValue = {
    isLoading,
    message,
    errors,
    touched,
    setErrors,
    setTouched,
    loginCredentials,
    setLoginCredentials,
    handleLogin,
    signUpCredentials,
    setSignUpCredentials,
    otp,
    setOtp,
    otpSent,
    otpRefs,
    handleSendOtp,
    handleSignUp,
    handleOtpChange,
    handleOtpKeyDown,
    // Forgot password
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordOtp,
    setForgotPasswordOtp,
    forgotPasswordOtpSent,
    forgotPasswordOtpVerified,
    forgotPasswordCredentials,
    setForgotPasswordCredentials,
    forgotPasswordOtpRefs,
    handleForgotPasswordSendOtp,
    handleVerifyForgotPasswordOtp,
    handleResetPassword,
    handleForgotPasswordOtpChange,
    handleForgotPasswordOtpKeyDown,
  };

  return (
    <AuthContext.Provider value={ctxValue}>
      {children}
    </AuthContext.Provider>
  );
}