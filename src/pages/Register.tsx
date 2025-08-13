import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, GraduationCap, Building, ArrowRight, Shield, ArrowLeft, Key, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlitchButton from '../components/GlitchButton';
import AnimatedBackground from '../components/AnimatedBackground';
import { registerUser, checkUserExists } from '../lib/database';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || '',
    department: '',
    year: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const formatContactNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const limitedValue = cleanValue.slice(0, 10);
    
    if (limitedValue.length >= 6) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3, 6)}-${limitedValue.slice(6)}`;
    } else if (limitedValue.length >= 3) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
    }
    return limitedValue;
  };

  const validateContactNumber = (number: string) => {
    if (!number.trim()) {
      return 'Contact number is required';
    }
    
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(cleanNumber[0])) {
      return 'Please enter a valid Indian mobile number (starting with 6, 7, 8, or 9)';
    }
    
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return 'Password is required';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword.trim()) {
      return 'Please confirm your password';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
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

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
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

  const generateAnonymousId = (role: string) => {
    const prefix = role === 'student' ? 'Student' : 'Faculty';
    const randomNum = Math.floor(Math.random() * 999) + 100;
    return `${prefix}#${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user already exists
      const { exists, error: checkError } = await checkUserExists(formData.email);
      
      if (checkError) {
        setErrors({ submit: 'Error checking user existence. Please try again.' });
        setIsLoading(false);
        return;
      }

      if (exists) {
        setErrors({ email: 'An account with this email already exists. Please login instead.' });
        setIsLoading(false);
        return;
      }

      // Register the user
      const { data: newUser, error: registerError } = await registerUser({
        email: formData.email,
        role: formData.role as 'student' | 'faculty',
        department: formData.department,
        year: formData.year,
        contactNumber: formData.contactNumber.replace(/\D/g, ''),
        password: formData.password,
        theme: formData.role === 'student' ? 'blue_neon' : 'red_alert'
      });

      if (registerError) {
        setErrors({ submit: registerError.message || 'Registration failed. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Success - redirect to login
      alert('Account created successfully! You can now login.');
      navigate(`/login?role=${formData.role}`);

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'contactNumber') {
      const formattedValue = formatContactNumber(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation
    if (field === 'email' && value.trim()) {
      const emailError = validateEmail(value);
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
      }
    }

    if (field === 'password' && value.trim()) {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
    }

    if (field === 'confirmPassword' && value.trim()) {
      const confirmPasswordError = validateConfirmPassword(formData.password, value);
      if (confirmPasswordError) {
        setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
      }
    }
    if (field === 'contactNumber' && value.trim()) {
      const contactError = validateContactNumber(value);
      if (contactError) {
        setErrors(prev => ({ ...prev, contactNumber: contactError }));
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
                Create Account
              </h1>
            </div>
            <p className="text-gray-400 font-rajdhani text-sm sm:text-base">
              Join the secure anonymous communication system
            </p>
            <p className="text-gray-500 font-rajdhani text-xs sm:text-sm mt-2">
              Manipal University Students & Faculty Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                Manipal University Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                  placeholder="your.name@manipal.edu"
                  required
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
              <p className="text-gray-500 text-xs mt-1">
                Accepted domains: @manipal.edu or @learner.manipal.edu
              </p>
            </div>

            {/* Contact Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                Contact Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <div className="absolute left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                  +91
                </div>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-16 sm:pl-20 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                  placeholder="XXX-XXX-XXXX"
                  required
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
                  Valid Indian mobile number
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Enter 10-digit Indian mobile number
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                Password *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter secure password"
                  required
                  style={{
                    focusBorderColor: 'var(--form-primary)',
                    borderColor: formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : undefined
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                  onBlur={(e) => e.target.style.borderColor = formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.password}
              </p>}
              {!errors.password && formData.password && formData.password.length >= 6 && (
                <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Password meets requirements
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Minimum 6 characters required
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani uppercase tracking-wide">
                Confirm Password *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                  style={{
                    focusBorderColor: 'var(--form-primary)',
                    borderColor: formData.confirmPassword ? (errors.confirmPassword ? '#ef4444' : 'var(--form-primary)') : undefined
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                  onBlur={(e) => e.target.style.borderColor = formData.confirmPassword ? (errors.confirmPassword ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.confirmPassword}
              </p>}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Passwords match
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 font-rajdhani uppercase tracking-wide">
                Select Role *
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
                Department *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-white focus:outline-none transition-all duration-300 appearance-none text-sm sm:text-base"
                  required
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
                  Academic Year *
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

            {/* Submit Button */}
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
                  <span className="text-sm sm:text-base">Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Create Account</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
            </GlitchButton>

            {errors.submit && (
              <p className="text-red-400 text-xs sm:text-sm text-center">{errors.submit}</p>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/50">
            <p className="text-center text-gray-500 text-xs font-rajdhani">
              🔒 All information is encrypted and secure
            </p>
            <p className="text-center text-gray-600 text-xs font-rajdhani mt-1">
              Restricted to Manipal University community
            </p>
            <div className="text-center mt-2">
              <span className="text-gray-500 text-xs">Already have an account? </span>
              <button
                onClick={() => navigate(`/login?role=${formData.role}`)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-medium"
              >
                Click here to login
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