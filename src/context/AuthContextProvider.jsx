import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from "./AuthContext";

export default function AuthContextProvider({ children }) {
  const navigate = useNavigate();

  // --- State and Refs ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [signUpCredentials, setSignUpCredentials] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef([]);

  // --- Login Success State ---
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // --- Navigation Effect ---
  useEffect(() => {
    console.log('useEffect triggered, loginSuccess:', loginSuccess);
    if (loginSuccess && !hasNavigated) {
      const userRole = localStorage.getItem('userRole');
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
        console.log('Navigating to /student/dashboard');
        navigate('/student/dashboard', { replace: true });
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
        const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, loginCredentials);
        console.log('Login response:', response.data);
        if (response.data && response.data.token) {
          console.log('Token received:', response.data.token);
          localStorage.setItem('token', response.data.token);
          
          // Store user role for navigation
          if (response.data.role) {
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
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

  // --- Send OTP Handler ---
  const handleSendOtp = async () => {
    console.log('handleSendOtp called with email:', signUpCredentials.email);
    setTouched(prev => ({ ...prev, email: true }));
    if (validateEmailForSignup(signUpCredentials.email)) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post(API_ENDPOINTS.SIGNUP, { email: signUpCredentials.email });
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
        const verifyResponse = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP, { email: signUpCredentials.email, otp: fullOtp });
        console.log('Verify OTP response:', verifyResponse.data);
        const setPasswordResponse = await axiosInstance.post(API_ENDPOINTS.SET_PASSWORD, signUpCredentials);
        console.log('Set password response:', setPasswordResponse.data);
        setMessage(setPasswordResponse.data.message);
        const tokenResponse = await axiosInstance.post(API_ENDPOINTS.GENERATE_TOKEN, { email: signUpCredentials.email });
        console.log('Generate token response:', tokenResponse.data);
        const token = tokenResponse.data.token;
        localStorage.setItem('token', token);
        console.log('Navigating to /student/StudentForm with token:', token);
        navigate(`/student/StudentForm?token=${token}`, { replace: true });
        setSignUpCredentials({ email: '', password: '' });
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
  };

  return (
    <AuthContext.Provider value={ctxValue}>
      {children}
    </AuthContext.Provider>
  );
}