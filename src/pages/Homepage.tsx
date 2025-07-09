import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Users, ArrowRight, Terminal, Lock, Wifi, Video, Monitor } from 'lucide-react';
import GlitchButton from '../components/GlitchButton';
import AnimatedBackground from '../components/AnimatedBackground';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [useVideoBackground, setUseVideoBackground] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Anonymous',
      description: 'Complete anonymity with encrypted communications'
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Instant messaging with zero latency'
    },
    {
      icon: Users,
      title: 'Student-Faculty Bridge',
      description: 'Connect across academic hierarchies safely'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '2,847', icon: Users },
    { label: 'Messages Sent', value: '156K', icon: Terminal },
    { label: 'Security Level', value: '99.9%', icon: Lock },
    { label: 'Uptime', value: '24/7', icon: Wifi }
  ];

  // Handle video switching
  const switchToVideo = () => {
    setUseVideoBackground(true);
    setVideoError(false);
    setVideoLoaded(false);
  };

  const switchToAnimated = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setUseVideoBackground(false);
    setVideoLoaded(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video failed to load:', e);
    setVideoError(true);
    setUseVideoBackground(false);
    setVideoLoaded(false);
  };

  const handleVideoLoaded = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setVideoError(false);
  };

  // Reset video state when switching backgrounds
  useEffect(() => {
    if (!useVideoBackground) {
      setVideoLoaded(false);
    }
  }, [useVideoBackground]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Video or Animated */}
      {useVideoBackground ? (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            onCanPlay={() => setVideoLoaded(true)}
            onLoadStart={() => setVideoLoaded(false)}
          >
            {/* Working video sources - replaced with reliable URLs */}
            <source src="https://cdn.pixabay.com/video/2025/04/27/275101_large.mp4" type="video/mp4" />
            <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
            <source src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4" type="video/mp4" />
            
            {/* Fallback message */}
            Your browser does not support the video tag.
          </video>
          
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          
          {/* Video Loading Indicator */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-rajdhani">Loading video...</p>
              </div>
            </div>
          )}
          
          {/* Video Error State */}
          {videoError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
              <div className="text-center text-white px-4">
                <Video className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="font-rajdhani mb-4">Video failed to load</p>
                <button
                  onClick={switchToAnimated}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition-colors font-rajdhani font-semibold"
                >
                  Switch to Animated Background
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <AnimatedBackground />
          
          {/* Dark overlay for better text contrast */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-[-1]" />

          {/* Additional cyberpunk effects overlay */}
          <div className="absolute top-0 left-0 w-full h-full z-[-1]">
            {/* Grid overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                animation: 'grid-move 20s linear infinite'
              }}
            />
          </div>
        </>
      )}
      
      {/* Navigation */}
      <nav className="relative z-30 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            <span className="font-orbitron text-lg sm:text-xl font-bold text-cyan-400">AnonBridge</span>
          </div>
          
          {/* Navigation Right Side - Admin, Login, and Background Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Background Controls - Desktop */}
            <div className="hidden lg:flex bg-black/70 backdrop-blur-md border border-gray-600/50 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={switchToAnimated}
                className={`px-3 py-2 transition-all duration-300 flex items-center gap-2 text-xs font-rajdhani font-semibold ${
                  !useVideoBackground 
                    ? 'bg-cyan-500/30 text-cyan-300 border-r border-cyan-500/50' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Animated Background"
              >
                <Monitor className="w-4 h-4" />
                <span>Animated</span>
              </button>
              <button
                onClick={switchToVideo}
                className={`px-3 py-2 transition-all duration-300 flex items-center gap-2 text-xs font-rajdhani font-semibold ${
                  useVideoBackground 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Video Background"
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>

            {/* Background Controls - Tablet */}
            <div className="hidden sm:flex lg:hidden bg-black/70 backdrop-blur-md border border-gray-600/50 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={switchToAnimated}
                className={`px-2 py-2 transition-all duration-300 flex items-center gap-1 text-xs font-rajdhani font-semibold ${
                  !useVideoBackground 
                    ? 'bg-cyan-500/30 text-cyan-300 border-r border-cyan-500/50' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Animated Background"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden md:inline">Anim</span>
              </button>
              <button
                onClick={switchToVideo}
                className={`px-2 py-2 transition-all duration-300 flex items-center gap-1 text-xs font-rajdhani font-semibold ${
                  useVideoBackground 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Video Background"
              >
                <Video className="w-4 h-4" />
                <span className="hidden md:inline">Video</span>
              </button>
            </div>

            {/* Admin and Login Buttons */}
            <GlitchButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3"
            >
              Admin
            </GlitchButton>
            <GlitchButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Login
            </GlitchButton>
          </div>
        </div>
      </nav>

      {/* Mobile Background Controls - Below Navigation */}
      <div className="sm:hidden relative z-30 px-4 -mt-2 mb-4">
        <div className="flex justify-center">
          <div className="flex bg-black/70 backdrop-blur-md border border-gray-600/50 rounded-lg overflow-hidden shadow-lg">
            <button
              onClick={switchToAnimated}
              className={`px-3 py-2 transition-all duration-300 flex items-center gap-2 text-xs font-rajdhani font-semibold ${
                !useVideoBackground 
                  ? 'bg-cyan-500/30 text-cyan-300 border-r border-cyan-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Animated Background"
            >
              <Monitor className="w-4 h-4" />
              <span>Animated</span>
            </button>
            <button
              onClick={switchToVideo}
              className={`px-3 py-2 transition-all duration-300 flex items-center gap-2 text-xs font-rajdhani font-semibold ${
                useVideoBackground 
                  ? 'bg-cyan-500/30 text-cyan-300' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Video Background"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-30 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-8 sm:pt-0">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 sm:mb-6 neon-glow text-flicker">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              AnonBridge
            </span>
          </h1>
          
          <p className="font-rajdhani text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white-300 uppercase tracking-wide">
            Secure • Anonymous • Futuristic
          </p>
          
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 text-white-300 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 p-3 sm:p-4 rounded-lg">
            Connect with your academic community through encrypted, anonymous conversations. 
            Break down barriers while maintaining complete privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
            <GlitchButton
              onClick={() => navigate('/login?role=student')}
              variant="primary"
              size="lg"
              glitchIntensity="medium"
              className="w-full sm:w-auto"
            >
              <Users className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Student Access
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </GlitchButton>
            
            <GlitchButton
              onClick={() => navigate('/login?role=faculty')}
              variant="secondary"
              size="lg"
              glitchIntensity="medium"
              className="w-full sm:w-auto"
            >
              <Shield className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Faculty Portal
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </GlitchButton>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 sm:p-4 text-center hover:border-cyan-500/60 transition-all duration-300 hover:transform hover:scale-105"
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-cyan-400" />
                <div className="font-orbitron text-lg sm:text-2xl font-bold text-cyan-300 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 sm:p-6 text-center hover:border-cyan-500/60 transition-all duration-300 hover:transform hover:scale-105"
            >
              <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-cyan-400" />
              <h3 className="font-orbitron text-lg sm:text-xl font-bold mb-2 text-cyan-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-30 py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900/70 to-gray-900/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-cyan-300">
            The Future of Academic Communication
          </h2>
          <p className="text-base sm:text-lg text-white-300 leading-relaxed mb-6 sm:mb-8">
            AnonBridge leverages cutting-edge encryption and anonymous networking to create 
            a safe space for academic discourse. Whether you're a student seeking guidance 
            or faculty looking to connect, our platform ensures your privacy while fostering 
            meaningful conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <GlitchButton
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              glitchIntensity="low"
              className="w-full sm:w-auto"
            >
              <Terminal className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Get Started
            </GlitchButton>
            <GlitchButton
              onClick={() => navigate('/admin')}
              variant="ghost"
              size="lg"
              glitchIntensity="low"
              className="w-full sm:w-auto"
            >
              <Shield className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Admin Panel
            </GlitchButton>
          </div>
        </div>
      </div>

      {/* Footer - Enhanced transparency and visibility */}
      <footer className="relative z-30 py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-700/50 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <span className="font-orbitron text-base sm:text-lg font-bold text-cyan-400">AnonBridge</span>
          </div>
          <p className="text-gray-300 text-sm font-medium">
            © 2024 AnonBridge. Secure anonymous communication platform.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            🔒 End-to-end encrypted • Zero data retention • Complete anonymity
          </p>
          
          {/* Additional footer links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs">
            <button className="text-gray-400 hover:text-cyan-400 transition-colors">
              Privacy Policy
            </button>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <button className="text-gray-400 hover:text-cyan-400 transition-colors">
              Terms of Service
            </button>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <button 
              onClick={() => navigate('/contact-support')}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes scan-lines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
};

export default Homepage;