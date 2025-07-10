'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, Zap, Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Theme colors matching your home page
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
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    if (searchParams.get('registered') === 'true') {
      setSuccess('Registration successful! Please log in.');
    }
  }, [searchParams]);

  const validateField = (field: string, value: string) => {
    let error = '';
    
    if (field === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (field === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };
  
  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    const { email, password } = formData;
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Use the callback URL from the result or fallback to dashboard
        const url = result?.url ? new URL(result.url) : null;
        const redirectUrl = url?.searchParams.get('callbackUrl') || '/dashboard';
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
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
    <div className={`min-h-screen transition-colors duration-300 bg-gradient-to-br ${colors.bg.primary}`}>
      {/* Inject custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: customAnimations }} />
      
      {/* Theme Toggle Button */}
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
      
      <div className="min-h-screen flex">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${colors.accent.blue} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r ${colors.accent.purple} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`} />
        </div>
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-black to-gray-900' : `bg-gradient-to-br ${colors.accent.blue}`}`}></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            
            {/* Back to Home */}
            <button 
              onClick={() => router.push('/')}
              className="absolute top-8 left-8 flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>

            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className={`w-12 h-12 bg-gradient-to-r ${colors.accent.blue} rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm bg-white/20`}>
                <span className="text-white font-bold text-xl">PG</span>
              </div>
              <span className="text-3xl font-bold">PineGenie</span>
            </div>

            <h1 className="text-4xl font-bold mb-6">
              Welcome Back to
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Pine Genie
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-md">
              Continue building amazing Pine Script strategies with our AI-powered visual builder.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { number: '10K+', label: 'Strategies Created' },
                { number: '2.5K+', label: 'Active Users' },
                { number: '98%', label: 'Success Rate' },
                { number: '90%', label: 'Time Saved' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-8 right-8 opacity-20">
              <Zap className="h-32 w-32" />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-md w-full">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center">
                <div className={`w-10 h-10 bg-gradient-to-r ${colors.accent.blue} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white font-bold">PG</span>
                </div>
                <span className={`text-2xl font-bold bg-gradient-to-r ${colors.accent.blue} bg-clip-text text-transparent`}>
                  PineGenie
                </span>
              </div>
            </div>

            {/* Form Container */}
            <div className={`${colors.bg.glass} backdrop-blur-xl rounded-2xl shadow-2xl border ${colors.border.primary} p-8`}>
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg.glass} ${colors.border.primary} border rounded-full mb-6 animate-pulse-glow`}>
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className={`text-sm ${colors.text.secondary}`}>
                    AI-Powered Strategy Builder
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
                <h2 className={`text-3xl font-bold ${colors.text.primary} mb-2`}>
                  Welcome Back
                </h2>
                <p className={`${colors.text.tertiary}`}>
                  Sign in to continue building strategies
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className={`mb-6 ${colors.bg.card} border ${colors.border.accent} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <p className={`text-green-400 text-sm`}>{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`mb-6 ${colors.bg.card} border border-red-500/50 rounded-lg p-4`}>
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className={`text-red-400 text-sm`}>{error}</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                
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
                      className={`block w-full pl-10 pr-3 py-3 border ${colors.border.primary} rounded-lg ${colors.bg.card} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm ${
                        fieldErrors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : ''
                      }`}
                      placeholder="Enter your email"
                     />
                  </div>
                  {fieldErrors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
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
                      className={`block w-full pl-10 pr-10 py-3 border ${colors.border.primary} rounded-lg ${colors.bg.card} ${colors.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm ${
                        fieldErrors.password && touched.password
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : ''
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className={`h-5 w-5 ${colors.text.muted} hover:${colors.text.secondary}`} />
                      ) : (
                        <Eye className={`h-5 w-5 ${colors.text.muted} hover:${colors.text.secondary}`} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm ${colors.text.secondary}`}>
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`group w-full bg-gradient-to-r ${colors.accent.blue} text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 animate-pulse-glow text-shadow-glow flex items-center justify-center gap-3 ${
                    isLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 animate-bounce" />
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${colors.border.primary}`} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${colors.bg.glass} ${colors.text.muted}`}>Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center py-2 px-4 border ${colors.border.primary} rounded-md shadow-sm ${colors.bg.card} text-sm font-medium ${colors.text.secondary} hover:${colors.bg.tertiary} transition-colors backdrop-blur-sm`}
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    className={`w-full inline-flex justify-center py-2 px-4 border ${colors.border.primary} rounded-md shadow-sm ${colors.bg.card} text-sm font-medium ${colors.text.secondary} hover:${colors.bg.tertiary} transition-colors backdrop-blur-sm`}
                  >
                    <span className="sr-only">Sign in with GitHub</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className={`text-sm ${colors.text.tertiary}`}>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/register')}
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Back Button */}
            <div className="lg:hidden text-center mt-6">
              <button 
                onClick={() => router.push('/')}
                className={`${colors.text.tertiary} hover:${colors.text.primary} transition-colors`}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}