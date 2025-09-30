import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';
import axios from 'axios';
import intuteLogo from '../assets/Intute.png';
import veloConnectLogo from '../assets/VeloConnectwb.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock credentials
const MOCK_CREDENTIALS = {
  email: 'admin@intuteai.in',
  password: 'password123',
};

function LoginModal({ setShowLogin, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }

    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    // Mock login for testing
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      console.log('Mock login successful for:', { email });
      setTimeout(() => {
        onSubmit('admin', 'Admin User', 'mock-jwt-token-12345', email);
        setShowLogin(false);
        setLoading(false);
      }, 1000); // Simulate network delay
      return;
    }

    // Actual API call for non-mock login
    try {
      console.log('Sending login request with:', { email, password });
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: email, // Backend expects 'username' field
        password,
      });
      console.log('Login response:', response.data);
      const { token } = response.data;
      onSubmit('admin', 'Admin User', token, email);
      setShowLogin(false);
    } catch (err) {
      console.error('Login error:', err.message);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Large Circle */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border-2 border-orange-500/20 animate-spin-slow"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-orange-400/30 animate-spin-reverse"></div>
        
        {/* Bottom Left Shapes */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-orange-500/10 to-red-500/10 animate-pulse-slow"></div>
        <div className="absolute bottom-32 left-16 w-6 h-6 rotate-45 bg-orange-500/30 animate-float"></div>
        <div className="absolute bottom-48 left-8 w-4 h-4 rotate-45 bg-red-500/40 animate-float-delayed"></div>
        
        {/* Top Left Elements */}
        <div className="absolute top-20 left-10 w-8 h-8 border-2 border-green-500/50 rotate-45 animate-rotate-slow"></div>
        <div className="absolute top-40 left-32 w-3 h-3 bg-blue-500/60 rounded-full animate-pulse delay-1000"></div>
        
        {/* Right Side Elements */}
        <div className="absolute top-1/3 right-16 w-12 h-1 bg-gradient-to-r from-orange-500/40 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 right-8 w-6 h-6 border border-red-500/40 rotate-45 animate-spin-slow"></div>
        
        {/* Center Background Orbits */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen">
          <div className="absolute inset-0 rounded-full border border-orange-500/5 animate-spin-very-slow" style={{width: '120%', height: '120%', top: '-10%', left: '-10%'}}></div>
          <div className="absolute inset-0 rounded-full border border-red-500/5 animate-spin-reverse-slow" style={{width: '140%', height: '140%', top: '-20%', left: '-20%'}}></div>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Tech-inspired Corner Elements */}
      <div className="absolute top-8 left-8 opacity-30">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <div className="w-8 h-1 bg-orange-500/50"></div>
            <div className="w-4 h-1 bg-orange-400/40"></div>
          </div>
          <div className="flex space-x-2">
            <div className="w-6 h-1 bg-red-500/40"></div>
            <div className="w-3 h-1 bg-red-400/30"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 opacity-30">
        <div className="flex flex-col space-y-2 items-end">
          <div className="flex space-x-2">
            <div className="w-4 h-1 bg-orange-400/40"></div>
            <div className="w-8 h-1 bg-orange-500/50"></div>
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-1 bg-red-400/30"></div>
            <div className="w-6 h-1 bg-red-500/40"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 20s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 25s linear infinite;
        }
        .animate-rotate-slow {
          animation: rotate-slow 8s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-orange-500/30 shadow-2xl overflow-hidden">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                  <span className="text-white font-medium text-lg">Authenticating...</span>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center -mb-4">
                  <img src={veloConnectLogo} alt="VeloConnect Logo" className="h-48 opacity-95" />
                </div>
                <div className="space-y-2 mb-4">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent tracking-wider">
                    VELO
                  </h1>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-orange-500 to-orange-500"></div>
                    <h2 className="text-2xl font-light text-orange-200 tracking-[0.3em] uppercase">
                      CONNECT
                    </h2>
                    <div className="h-px w-16 bg-gradient-to-r from-orange-500 via-orange-500 to-transparent"></div>
                  </div>
                </div>
                <div className="relative">
                  <p className="text-gray-300 text-lg font-medium">
                    Advanced Vehicle Intelligence Platform
                  </p>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"></div>
                </div>
              </div>

              {/* Intute Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative bg-black/40 rounded-2xl p-8 border border-orange-500/30 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-2xl"></div>
                  <img src={intuteLogo} alt="Intute AI Logo" className="h-24 opacity-95 relative z-10" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-300 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="mb-6 group">
                <label className="block text-orange-300 text-sm font-medium mb-2 uppercase tracking-wide">
                  User Credentials
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <User className="w-5 h-5 text-orange-400 group-focus-within:text-orange-300 transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter authorized email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-12 py-4 bg-black/40 border border-orange-500/30 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-500/30 text-white placeholder-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-8 group">
                <label className="block text-orange-300 text-sm font-medium mb-2 uppercase tracking-wide">
                  Security Access
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Lock className="w-5 h-5 text-orange-400 group-focus-within:text-orange-300 transition-colors duration-300" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-12 py-4 bg-black/40 border border-orange-500/30 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-500/30 text-white placeholder-gray-400 pr-14 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-300 transition-all duration-200 z-10 p-1 rounded-md hover:bg-orange-500/10"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="group relative w-full py-4 px-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:from-orange-600 hover:via-red-600 hover:to-orange-600 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="uppercase tracking-wide">
                      {loading ? 'Initializing System...' : 'Initialize Connection'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleReset}
                  className="group relative w-full py-4 px-6 bg-black/40 border border-orange-500/30 text-orange-300 hover:text-white hover:bg-black/60 hover:border-orange-500/50 font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative uppercase tracking-wide">
                    Clear Credentials
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">
                    Secured by <span className="text-orange-400 font-bold">Intute AI</span>
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></div>
                </div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;