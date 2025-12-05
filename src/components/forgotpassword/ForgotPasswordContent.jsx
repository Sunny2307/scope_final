import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Footer from '../layout/Footer';

// Asset URLs
const logoUrl = '/logo/Scope_logo.jpg';
const bgUrl = '/images/bg.jpg';

export default function ForgotPasswordContent() {
    const {
        forgotPasswordEmail,
        setForgotPasswordEmail,
        forgotPasswordOtp,
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
        isLoading,
        errors,
        touched,
        setTouched,
        setErrors,
        message
    } = useContext(AuthContext);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setForgotPasswordEmail(value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordCredentials(prev => ({ ...prev, [name]: value }));
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    const handleSendOtpSubmit = (e) => {
        e.preventDefault();
        handleForgotPasswordSendOtp();
    };

    const handleVerifyOtpSubmit = (e) => {
        e.preventDefault();
        handleVerifyForgotPasswordOtp();
    };

    const handleResetPasswordSubmit = (e) => {
        e.preventDefault();
        handleResetPassword();
    };

    return (
        <div
            className="min-h-screen w-screen flex flex-col bg-cover bg-center"
            style={{ backgroundImage: `url(${bgUrl})` }}
        >
            <main className="flex-grow w-full flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="flex flex-col items-center mb-8">
                        <img src={logoUrl} alt="Scope Logo" className="h-20 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Forgot Password</h1>
                    </div>

                    {!forgotPasswordOtpSent ? (
                        // Step 1: Enter Email
                        <form className="w-full flex flex-col gap-6" onSubmit={handleSendOtpSubmit}>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="Enter your email"
                                    value={forgotPasswordEmail}
                                    onChange={handleEmailChange}
                                    onBlur={() => setTouched(prev => ({...prev, email: true }))}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    aria-describedby="email-error"
                                />
                                {touched.email && errors.email && (
                                    <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={`w-full bg-teal-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-teal-700 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className="text-center text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">Login</Link>
                            </div>
                            {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}
                        </form>
                    ) : !forgotPasswordOtpVerified ? (
                        // Step 2: Verify OTP
                        <form className="w-full flex flex-col gap-6" onSubmit={handleVerifyOtpSubmit}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-800">Enter OTP</label>
                                <div className="flex justify-center gap-4">
                                    {forgotPasswordOtp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`otp-${idx}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleForgotPasswordOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleForgotPasswordOtpKeyDown(idx, e)}
                                            ref={(el) => (forgotPasswordOtpRefs.current[idx] = el)}
                                            className="w-12 h-12 text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors"
                                            aria-label={`OTP digit ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full bg-teal-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-teal-700 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="text-center text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">Login</Link>
                            </div>
                            {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}
                        </form>
                    ) : (
                        // Step 3: Reset Password
                        <form className="w-full flex flex-col gap-6" onSubmit={handleResetPasswordSubmit}>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="newPassword" className="text-sm font-medium text-gray-800">New Password</label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={forgotPasswordCredentials.newPassword}
                                    onChange={handlePasswordChange}
                                    onBlur={() => setTouched(prev => ({...prev, password: true }))}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    aria-describedby="password-error"
                                />
                                {touched.password && errors.password && (
                                    <p id="password-error" className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter new password"
                                    value={forgotPasswordCredentials.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors border-gray-300`}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full bg-teal-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-teal-700 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <div className="text-center text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">Login</Link>
                            </div>
                            {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}
                        </form>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}


