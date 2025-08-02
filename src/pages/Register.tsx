import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, GraduationCap, Building, ArrowRight, Shield, ArrowLeft, Key, CheckCircle, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlitchButton from '../components/GlitchButton';
import AnimatedBackground from '../components/AnimatedBackground';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    role: searchParams.get('role') || '',
    department: '',
    year: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English Literature',
    'Business Administration'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  // Apply role-based theme and styling
  useEffect(() => {
    const root = document.documentElement;
    if (formData.role === 'student') {
      root.style.setProperty('--form-primary', '#00d4ff');
      root.style.setProperty('--form-secondary', '#7c3aed');
      root.style.setProperty('--form-accent', '#06b6d4');
      root.style.setProperty('--form-glow', '#00d4ff80');
    } else if (formData.role === 'faculty') {
      root.style.setProperty('--form-primary', '#ff4444');
      root.style.setProperty('--form-secondary', '#ff8800');
      root.style.setProperty('--form-accent', '#ff6b35');
      root.style.setProperty('--form-glow', '#ff444480');
    } else {
      root.style.setProperty('--form-primary', '#00d4ff');
      root.style.setProperty('--form-secondary', '#7c3aed');
      root.style.setProperty('--form-accent', '#06b6d4');
      root.style.setProperty('--form-glow', '#00d4ff80');
    }
  }, [formData.role]);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    
    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }
    
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
      return 'Only Manipal University email addresses (@manipal.edu or @learner.manipal.edu) are allowed';
    }
    
    const emailRegex = /^[^\s@]+@(manipal\.edu|learner\.manipal\.edu)$/i;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid Manipal University email address';
    }
    
    return '';
  };

  const validateContactNumber = (number: string) => {
    if (!number.trim()) {
      return 'Contact number is required';
    }
    
    // Remove all non-digit characters for validation
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    
    // Check if it starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(cleanNumber[0])) {
      return 'Please enter a valid Indian mobile number';
    }
    
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const contactError = validateContactNumber(formData.contactNumber);
    if (contactError) {
      newErrors.contactNumber = contactError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }

    if (formData.role === 'student' && !formData.year) {
      newErrors.year = 'Please select your year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatContactNumber = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedValue = cleanValue.slice(0, 10);
    
    // Format as XXX-XXX-XXXX for better readability
    if (limitedValue.length >= 6) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3, 6)}-${limitedValue.slice(6)}`;
    } else if (limitedValue.length >= 3) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
    }
    
    return limitedValue;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate OTP sending to mobile number (replace with actual SMS API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOtpSent(true);
      setIsLoading(false);
      
      // In a real implementation, you would call your SMS API to send OTP
      console.log('OTP sent to mobile:', formData.contactNumber);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ submit: 'Failed to send OTP. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate OTP verification (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        // Registration successful, redirect to login
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        setErrors({ otp: 'Invalid OTP. Please try again.' });
      }
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: 'Failed to verify OTP. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Special handling for contact number formatting
    if (field === 'contactNumber') {
      const formattedValue = formatContactNumber(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'email' && value.trim()) {
      const emailError = validateEmail(value);
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
      }
    }
    
    if (field === 'contactNumber' && value.trim()) {
      const contactError = validateContactNumber(value);
      if (contactError) {
        setErrors(prev => ({ ...prev, contactNumber: contactError }));
      }
    }
    
    if (field === 'password' && value.trim()) {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
    }
  };

  const getFormStyles = () => {
    if (formData.role === 'student') {
      return {
        borderColor: 'var(--form-primary)',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
        boxShadow: '0 0 30px var(--form-glow)'
      };
    } else if (formData.role === 'faculty') {
      return {
        borderColor: 'var(--form-primary)',
        background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 136, 0, 0.1))',
        boxShadow: '0 0 30px var(--form-glow)'
      };
    }
    return {
      borderColor: '#374151',
      background: 'rgba(17, 24, 39, 0.8)',
      boxShadow: 'none'
    };
  };

  const isValidManipalEmail = (email: string) => {
    const emailLower = email.toLowerCase();
    return emailLower.endsWith('@manipal.edu') || emailLower.endsWith('@learner.manipal.edu');
  };

  const isValidContactNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length === 10 && ['6', '7', '8', '9'].includes(cleanNumber[0]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      {/* Back to Home */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20">
        <GlitchButton
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          glitchIntensity="low"
          className="backdrop-blur-sm"
        >
          <ArrowLeft className="mr-1 sm:mr-2 w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </GlitchButton>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-6">
        <div 
          className="backdrop-blur-xl border-2 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-500"
          style={getFormStyles()}
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Shield 
                className="w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-300" 
                style={{ color: 'var(--form-primary)' }}
              />
              <h1 
                className="font-orbitron text-2xl sm:text-3xl font-bold neon-glow transition-colors duration-300"
                style={{ color: 'var(--form-primary)' }}
              >
                {otpSent ? 'Verify Mobile' : 'Register'}
              </h1>
            </div>
            <p className="text-gray-400 font-rajdhani text-sm sm:text-base">
              {otpSent ? 'Enter the OTP sent to your mobile' : 'Create your AnonBridge account'}
            </p>
            <p className="text-gray-500 font-rajdhani text-xs sm:text-sm mt-2">
              Manipal University Students & Faculty Only
            </p>
          </div>

          {!otpSent ? (
            /* Registration Form */
            <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Manipal University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                    placeholder="your.name@manipal.edu"
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.email ? (errors.email ? '#ef4444' : 'var(--form-primary)') : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.email ? (errors.email ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.email}
                </p>}
                {!errors.email && formData.email && isValidManipalEmail(formData.email) && (
                  <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                    Valid Manipal University email
                  </p>
                )}
              </div>

              {/* Contact Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div className="absolute left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-16 sm:pl-20 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                    placeholder="XXX-XXX-XXXX"
                    maxLength={12} // Includes dashes
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.contactNumber ? (errors.contactNumber ? '#ef4444' : 'var(--form-primary)') : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.contactNumber ? (errors.contactNumber ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                  />
                </div>
                {errors.contactNumber && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.contactNumber}</p>}
                {!errors.contactNumber && formData.contactNumber && isValidContactNumber(formData.contactNumber) && (
                  <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                    Valid mobile number
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  OTP will be sent via SMS and WhatsApp for verification
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                    placeholder="Create a strong password"
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.password}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                    placeholder="Confirm your password"
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.confirmPassword ? (errors.confirmPassword ? '#ef4444' : 'var(--form-primary)') : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.confirmPassword ? (errors.confirmPassword ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 font-rajdhani uppercase tracking-wide">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {['student', 'faculty'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleInputChange('role', role)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        formData.role === role
                          ? 'text-white shadow-lg'
                          : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                      }`}
                      style={{
                        borderColor: formData.role === role ? 'var(--form-primary)' : undefined,
                        background: formData.role === role ? 'var(--form-glow)' : undefined,
                        boxShadow: formData.role === role ? '0 0 20px var(--form-glow)' : undefined
                      }}
                    >
                      {role === 'student' ? (
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                      <span className="font-rajdhani font-medium capitalize text-sm sm:text-base">{role}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.role}</p>}
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white focus:outline-none transition-all duration-300 appearance-none text-sm sm:text-base"
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.department ? 'var(--form-primary)' : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.department ? 'var(--form-primary)' : '#6b7280'}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-gray-800">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.department}</p>}
              </div>

              {/* Year Selection (Students Only) */}
              {formData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                    Academic Year
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleInputChange('year', year)}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 text-xs sm:text-sm font-medium ${
                          formData.year === year
                            ? 'text-white shadow-lg'
                            : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                        }`}
                        style={{
                          borderColor: formData.year === year ? 'var(--form-primary)' : undefined,
                          background: formData.year === year ? 'var(--form-glow)' : undefined,
                          boxShadow: formData.year === year ? '0 0 15px var(--form-glow)' : undefined
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  {errors.year && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.year}</p>}
                </div>
              )}

              {/* Send OTP Button */}
              <GlitchButton
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full"
                glitchIntensity="medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Sending OTP...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Send OTP to Mobile</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </GlitchButton>

              {errors.submit && (
                <p className="text-red-400 text-xs sm:text-sm text-center">{errors.submit}</p>
              )}
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-300 text-sm">
                  We've sent a 6-digit OTP to
                </p>
                <p className="text-white font-medium">+91 {formData.contactNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (errors.otp) {
                      setErrors(prev => ({ ...prev, otp: '' }));
                    }
                  }}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none transition-all duration-300"
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    focusBorderColor: 'var(--form-primary)',
                    borderColor: otp ? (errors.otp ? '#ef4444' : 'var(--form-primary)') : undefined
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                  onBlur={(e) => e.target.style.borderColor = otp ? (errors.otp ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                />
                {errors.otp && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.otp}</p>}
              </div>

              <GlitchButton
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                variant="primary"
                size="lg"
                className="w-full"
                glitchIntensity="medium"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Verify & Register</span>
                  </div>
                )}
              </GlitchButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setErrors({});
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back to registration form
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/50">
            <p className="text-center text-gray-500 text-xs font-rajdhani">
              🔒 All data is encrypted and secure
            </p>
            <div className="text-center mt-2">
              <span className="text-gray-500 text-xs">Already have an account? </span>
              <button
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-medium"
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Variables for dynamic styling */}
      <style jsx>{`
        :root {
          --form-primary: #00d4ff;
          --form-secondary: #7c3aed;
          --form-accent: #06b6d4;
          --form-glow: #00d4ff80;
        }
      `}</style>
    </div>
  );
};

export default Register;