'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Moon, Sun, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDark, setIsDark] = useState(false); // Default to light mode for SSR
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Theme colors matching your project
  const colors = isDark ? {
    bg: {
      primary: 'from-slate-900 via-slate-800 to-slate-900',
      secondary: 'bg-slate-800/80',
      tertiary: 'bg-slate-700/50',
      card: 'bg-slate-800/30',
      glass: 'bg-slate-800/80 backdrop-blur-xl',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      tertiary: 'text-slate-400',
      muted: 'text-slate-500',
    },
    border: {
      primary: 'border-slate-700/50',
      secondary: 'border-slate-600/30',
      accent: 'border-blue-500/50',
    },
    accent: {
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-amber-500 to-orange-500',
      red: 'from-red-500 to-pink-500',
    }
  } : {
    bg: {
      primary: 'from-gray-50 via-white to-gray-50',
      secondary: 'bg-white/90',
      tertiary: 'bg-gray-100/80',
      card: 'bg-white/60',
      glass: 'bg-white/80 backdrop-blur-xl',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      tertiary: 'text-gray-600',
      muted: 'text-gray-500',
    },
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300/50',
      accent: 'border-blue-400/50',
    },
    accent: {
      blue: 'from-blue-400 to-cyan-400',
      purple: 'from-purple-400 to-pink-400',
      green: 'from-green-400 to-emerald-400',
      orange: 'from-amber-400 to-orange-400',
      red: 'from-red-400 to-pink-400',
    }
  };

  // Custom animations
  const customAnimations = `
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3); }
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .text-shadow-glow {
      text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
  `;

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Check for dark mode preference (client-side only)
    if (typeof window !== 'undefined') {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      setIsDark(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') {
      checkPasswordStrength(value);
    }
    
    // Real-time validation
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login page with success message and redirect back to dashboard
      const callbackUrl = '/dashboard';
      router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <style jsx>{customAnimations}</style>
      <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark' : ''}`}>
        <div className={`min-h-screen flex bg-gradient-to-br ${colors.bg.primary}`}>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-20 left-20 w-72 h-72 bg-gradient-to-r ${colors.accent.blue} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`}></div>
            <div className={`absolute top-40 right-20 w-72 h-72 bg-gradient-to-r ${colors.accent.purple} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000`}></div>
            <div className={`absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r ${colors.accent.orange} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000`}></div>
          </div>
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-black to-gray-900' : colors.accent.blue}`}></div>
            <div className="relative z-10 flex flex-col justify-center px-12 text-white">
              
              {/* Back to Home */}
              <button 
                onClick={() => router.push('/')}
                className="absolute top-8 left-8 flex items-center text-white hover:text-white/90 transition-all duration-200 hover:scale-105 drop-shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium">Back to Home</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`fixed top-4 right-4 z-50 p-3 rounded-full ${colors.bg.glass} ${colors.border.primary} border backdrop-blur-sm hover:${colors.bg.tertiary} transition-all duration-300 hover:scale-110`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className={`h-5 w-5 ${colors.text.secondary}`} />
                ) : (
                  <Moon className={`h-5 w-5 ${colors.text.secondary}`} />
                )}
              </button>
              
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Sparkles className="h-10 w-10 mr-4 text-yellow-400 animate-pulse" />
                    <div className="absolute inset-0 h-10 w-10 mr-4 text-yellow-400 animate-ping opacity-20">
                      <Sparkles className="h-10 w-10" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">PineGenie</h1>
                </div>
                <p className="text-xl text-white mb-8 leading-relaxed drop-shadow-md">
                  Join thousands of creators transforming their content with AI-powered innovation
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-white hover:text-white/90 transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-400 drop-shadow-sm" />
                    <span className="font-medium drop-shadow-sm">AI-powered content generation</span>
                  </div>
                  <div className="flex items-center text-white hover:text-white/90 transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-400 drop-shadow-sm" />
                    <span className="font-medium drop-shadow-sm">Advanced customization tools</span>
                  </div>
                  <div className="flex items-center text-white hover:text-white/90 transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-400 drop-shadow-sm" />
                    <span className="font-medium drop-shadow-sm">Seamless workflow integration</span>
                  </div>
                  <div className="flex items-center text-white hover:text-white/90 transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-400 drop-shadow-sm" />
                    <span className="font-medium drop-shadow-sm">Enterprise-grade security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className={`w-full max-w-md ${colors.bg.glass} rounded-2xl shadow-2xl border ${colors.border.primary} p-8`}>
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center">
                  <Sparkles className="h-8 w-8 mr-3 text-yellow-400" />
                  <span className={`text-2xl font-bold ${colors.text.primary}`}>PineGenie</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 ${colors.bg.secondary} rounded-full`}>
                    <User className={`h-8 w-8 ${colors.text.primary}`} />
                  </div>
                </div>
                <h2 className={`text-3xl font-bold ${colors.text.primary} mb-2`}>Create Account</h2>
                <p className={`${colors.text.secondary}`}>Join PineGenie and start creating amazing content</p>
              </div>

              {/* Success Message */}
              {success && (
                <div className={`mb-6 ${colors.bg.tertiary} border ${colors.border.accent} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`mb-6 ${colors.bg.tertiary} border border-red-500/50 rounded-lg p-4`}>
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 border border-gray-300 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'border-slate-600' : 'border-gray-300'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-500'}`}>
                    Or sign up with email
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${colors.text.muted}`} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      onKeyPress={handleKeyPress}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${colors.bg.secondary} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        fieldErrors.name && touched.name
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : `${colors.border.primary} focus:ring-blue-500 focus:border-blue-500`
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {fieldErrors.name && touched.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${colors.text.muted}`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      onKeyPress={handleKeyPress}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${colors.bg.secondary} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        fieldErrors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : `${colors.border.primary} focus:ring-blue-500 focus:border-blue-500`
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {fieldErrors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${colors.text.muted}`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      onKeyPress={handleKeyPress}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${colors.bg.secondary} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        fieldErrors.password && touched.password
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : `${colors.border.primary} focus:ring-blue-500 focus:border-blue-500`
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colors.text.muted} hover:${colors.text.secondary} transition-colors`}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={colors.text.muted}>Password strength:</span>
                        <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-blue-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className={`mt-1 w-full ${colors.bg.tertiary} rounded-full h-1.5`}>
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${colors.text.muted}`} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      onKeyPress={handleKeyPress}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${colors.bg.secondary} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        fieldErrors.confirmPassword && touched.confirmPassword
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : `${colors.border.primary} focus:ring-blue-500 focus:border-blue-500`
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colors.text.muted} hover:${colors.text.secondary} transition-colors`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${colors.accent.blue} text-white py-3 px-4 rounded-lg font-semibold hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isLoading ? 'opacity-75 cursor-not-allowed transform-none' : 'hover:shadow-blue-500/25'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <User className="h-5 w-5 mr-2" />
                      Create Account
                    </div>
                  )}
                </button>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Mobile Back Button */}
            <div className="lg:hidden text-center mt-6">
              <button 
                onClick={() => router.push('/')}
                className={`${colors.text.secondary} hover:${colors.text.primary} transition-colors flex items-center justify-center mx-auto`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}