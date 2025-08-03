import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, GraduationCap, Building, ArrowRight, Shield, ArrowLeft, Key } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import GlitchButton from '../components/GlitchButton';
import AnimatedBackground from '../components/AnimatedBackground';
import { checkUserExists } from '../lib/database';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useUser();
  const { setCurrentTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: searchParams.get('role') || '',
    department: '',
    year: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [userExists, setUserExists] = useState(false);

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

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (showPasswordField) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if user exists when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (formData.email && !validateEmail(formData.email)) {
        try {
          const { exists, user, error } = await checkUserExists(formData.email);
          
          if (!error) {
            setUserExists(exists);
            setShowPasswordField(exists);
            
            if (exists && user) {
              setFoundUser(user);
              // Pre-fill form with user data
              setFormData(prev => ({
                ...prev,
                role: user.role || prev.role,
                department: user.department || prev.department,
                year: user.year || prev.year
              }));
            }
          }
        } catch (error) {
          console.error('Error checking user:', error);
        }
      } else {
        setUserExists(false);
        setShowPasswordField(false);
      }
    };

    const timeoutId = setTimeout(checkUser, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const generateAnonymousId = (role: string) => {
    const prefix = role === 'student' ? 'Student' : 'Faculty';
    const randomNum = Math.floor(Math.random() * 999) + 100;
    return `${prefix}#${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!userExists) {
      setErrors({ email: 'No account found with this email. Please register first.' });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate login authentication (replace with actual authentication)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create user object using actual database user data
      const user = {
        id: foundUser.id,
        email: formData.email,
        role: formData.role as 'student' | 'faculty',
        department: formData.department,
        year: formData.year,
        anonymousId: foundUser.anonymous_id
      };

      setUser(user);

      // Set theme based on role
      if (user.role === 'student') {
        setCurrentTheme('blue_neon');
      } else {
        setCurrentTheme('red_alert');
      }

      // Navigate to appropriate dashboard
      navigate(user.role === 'student' ? '/student' : '/faculty');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Login failed. Please check your credentials and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time email validation for better UX
    if (field === 'email' && value.trim()) {
      const emailError = validateEmail(value);
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      {/* Back to Home - Fixed positioning */}
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
                Access Portal
              </h1>
            </div>
            <p className="text-gray-400 font-rajdhani text-sm sm:text-base">
              Secure anonymous communication system
            </p>
            <p className="text-gray-500 font-rajdhani text-xs sm:text-sm mt-2">
              Manipal University Students & Faculty Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
              {!errors.email && formData.email && isValidManipalEmail(formData.email) && userExists && (
                <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Account found - please enter your password
                </p>
              )}
              {!errors.email && formData.email && isValidManipalEmail(formData.email) && !userExists && (
                <p className="text-yellow-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                  No account found with this email
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Accepted domains: @manipal.edu or @learner.manipal.edu
              </p>
            </div>

            {/* Password Field - Only show if user exists */}
            {showPasswordField && (
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
                    placeholder="Enter your password"
                    style={{
                      focusBorderColor: 'var(--form-primary)',
                      borderColor: formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : undefined
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--form-primary)'}
                    onBlur={(e) => e.target.style.borderColor = formData.password ? (errors.password ? '#ef4444' : 'var(--form-primary)') : '#6b7280'}
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.password}</p>}
              </div>
            )}

            {/* Role Selection - Only show if user exists */}
            {showPasswordField && (
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
            )}

            {/* Department Selection - Only show if user exists */}
            {showPasswordField && (
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
            )}

            {/* Year Selection (Students Only) - Only show if user exists */}
            {showPasswordField && formData.role === 'student' && (
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

            {/* Submit Button */}
            <GlitchButton
              type="submit"
              disabled={isLoading || !showPasswordField}
              variant="primary"
              size="lg"
              className="w-full"
              glitchIntensity="medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Accessing System...</span>
                </div>
              ) : !showPasswordField ? (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Enter Valid Email First</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Enter AnonBridge</span>
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
              🔒 All communications are encrypted and anonymous
            </p>
            <p className="text-center text-gray-600 text-xs font-rajdhani mt-1">
              Restricted to Manipal University community
            </p>
            <div className="text-center mt-2">
              <span className="text-gray-500 text-xs">Don't have an account? </span>
              <button
                onClick={() => navigate(`/register?role=${formData.role}`)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-medium"
              >
                Click here to register
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

export default Login;