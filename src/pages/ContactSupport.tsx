import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle, Shield, Users, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import GlitchButton from '../components/GlitchButton';
import AnimatedBackground from '../components/AnimatedBackground';

const ContactSupport: React.FC = () => {
  const navigate = useNavigate();

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      primary: 'support@anonbridge.manipal.edu',
      secondary: 'technical@anonbridge.manipal.edu',
      description: 'For general inquiries and technical issues',
      availability: '24/7 Response within 2-4 hours',
      color: '#00d4ff'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      primary: '+91 820-2925-000',
      secondary: '+91 820-2925-001 (Emergency)',
      description: 'Direct phone support for urgent matters',
      availability: 'Mon-Fri: 9:00 AM - 6:00 PM IST',
      color: '#7c3aed'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      primary: 'Available on platform',
      secondary: 'Anonymous support chat',
      description: 'Real-time assistance through secure chat',
      availability: 'Mon-Fri: 10:00 AM - 8:00 PM IST',
      color: '#06b6d4'
    },
    {
      icon: MapPin,
      title: 'Physical Office',
      primary: 'IT Support Center, Block IV',
      secondary: 'Manipal Institute of Technology',
      description: 'Manipal Academy of Higher Education, Manipal - 576104',
      availability: 'Mon-Fri: 9:00 AM - 5:00 PM IST',
      color: '#10b981'
    }
  ];

  const supportCategories = [
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Report security vulnerabilities, privacy concerns, or data protection issues',
      email: 'security@anonbridge.manipal.edu',
      priority: 'High Priority'
    },
    {
      icon: Users,
      title: 'Account Issues',
      description: 'Login problems, account access, or authentication difficulties',
      email: 'accounts@anonbridge.manipal.edu',
      priority: 'Medium Priority'
    },
    {
      icon: AlertTriangle,
      title: 'Report Abuse',
      description: 'Report inappropriate behavior, harassment, or platform misuse',
      email: 'abuse@anonbridge.manipal.edu',
      priority: 'Urgent Priority'
    },
    {
      icon: FileText,
      title: 'Technical Support',
      description: 'Platform bugs, feature requests, or technical difficulties',
      email: 'technical@anonbridge.manipal.edu',
      priority: 'Standard Priority'
    }
  ];

  const faqItems = [
    {
      question: 'How do I reset my password?',
      answer: 'Currently, AnonBridge uses your Manipal University email for authentication. Contact your IT department for password resets.'
    },
    {
      question: 'Is my identity really anonymous?',
      answer: 'Yes, all conversations use anonymous IDs. Your real identity is never shared with other users, only with system administrators when necessary.'
    },
    {
      question: 'How do I report inappropriate behavior?',
      answer: 'Use the flag button in any chat message or contact abuse@anonbridge.manipal.edu directly for serious violations.'
    },
    {
      question: 'Can faculty see my real identity?',
      answer: 'No, faculty only see your anonymous ID (e.g., Student#123). Your real identity remains protected.'
    },
    {
      question: 'What if I encounter technical issues?',
      answer: 'Contact technical@anonbridge.manipal.edu or use the live chat feature for immediate assistance.'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400" />
              <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 neon-glow">
                Contact Support
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get help with AnonBridge platform. Our dedicated support team is here to assist you 
              with any questions, technical issues, or concerns you may have.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Average Response Time: 2-4 hours</span>
            </div>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 sm:p-8 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${method.color}20` }}
                  >
                    <method.icon 
                      className="w-6 h-6 sm:w-8 sm:h-8" 
                      style={{ color: method.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-orbitron text-lg sm:text-xl font-bold text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mb-3">{method.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm sm:text-base">{method.primary}</span>
                    {method.title === 'Email Support' && (
                      <a 
                        href={`mailto:${method.primary}`}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Send Email"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {method.title === 'Phone Support' && (
                      <a 
                        href={`tel:${method.primary.replace(/\s/g, '')}`}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Call Now"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">{method.secondary}</div>
                </div>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{method.availability}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Support Categories */}
          <div className="mb-16">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-center text-cyan-300 mb-8 sm:mb-12">
              Support Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <category.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-rajdhani text-lg sm:text-xl font-bold text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-400 text-sm sm:text-base mb-3">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <a 
                      href={`mailto:${category.email}`}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm flex items-center gap-2"
                    >
                      {category.email}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.priority === 'Urgent Priority' ? 'bg-red-500/20 text-red-400' :
                      category.priority === 'High Priority' ? 'bg-orange-500/20 text-orange-400' :
                      category.priority === 'Medium Priority' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {category.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-center text-cyan-300 mb-8 sm:mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300"
                >
                  <h3 className="font-rajdhani text-lg sm:text-xl font-bold text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 sm:p-8 mb-16">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg sm:text-xl font-bold text-red-400 mb-3">
                  Emergency Contact
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mb-4">
                  For urgent security issues, immediate threats, or critical platform failures that require immediate attention:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:emergency@anonbridge.manipal.edu"
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-mono text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4" />
                    emergency@anonbridge.manipal.edu
                  </a>
                  <a 
                    href="tel:+918202925001"
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-mono text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4" />
                    +91 820-2925-001
                  </a>
                </div>
                <p className="text-red-300 text-xs sm:text-sm mt-2">
                  Available 24/7 for critical issues only
                </p>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="text-center">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-cyan-300 mb-6 sm:mb-8">
              Additional Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-rajdhani text-lg font-bold text-white mb-2">User Guide</h3>
                <p className="text-gray-400 text-sm mb-4">Comprehensive platform documentation</p>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium">
                  View Documentation
                </button>
              </div>
              
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-rajdhani text-lg font-bold text-white mb-2">Privacy Policy</h3>
                <p className="text-gray-400 text-sm mb-4">Learn about data protection</p>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium">
                  Read Policy
                </button>
              </div>
              
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center sm:col-span-2 lg:col-span-1">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-rajdhani text-lg font-bold text-white mb-2">Community Guidelines</h3>
                <p className="text-gray-400 text-sm mb-4">Platform rules and best practices</p>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium">
                  View Guidelines
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <p className="text-gray-400 text-sm sm:text-base">
                <strong className="text-cyan-400">Note:</strong> AnonBridge is committed to maintaining your privacy and security. 
                All support communications are handled with the same level of confidentiality as platform interactions.
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                🔒 Secure • Confidential • Professional Support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;