import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Footer from '../layout/Footer';

// Asset URLs
const logoUrl = '/logo/Scope_logo.jpg';
const bgUrl = '/images/bg.jpg';

export default function LoginContent() {
    const {
        loginCredentials,
        setLoginCredentials,
        handleLogin,
        isLoading,
        errors,
        touched,
        setTouched,
        setErrors,
        message
    } = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginCredentials(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
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
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
                        {/* <p className="text-sm text-gray-600">P. D. Patel Institute of Applied Science</p> */}
                    </div>

                    <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                placeholder="Enter your charusat email, admin, or operator"
                                value={loginCredentials.email}
                                onChange={handleChange}
                                onBlur={() => setTouched(prev => ({...prev, email: true }))}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                aria-describedby="email-error"
                            />
                            {touched.email && errors.email && (
                                <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-800">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={loginCredentials.password}
                                onBlur={() => setTouched(prev => ({...prev, password: true }))}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-teal-500 bg-white text-black transition-colors ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                aria-describedby="password-error"
                            />
                            {touched.password && errors.password && (
                                <p id="password-error" className="text-sm text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-teal-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-teal-700 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>

                        <div className="text-center">
                            <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">Forgot Password?</Link>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">Sign Up</Link>
                        </div>
                        {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
