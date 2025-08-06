import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import intuteLogo from '../assets/intuteAILogo.png';

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

    try {
      console.log('Sending login request with:', { email, password }); // Debug log
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data); // Debug log
      const { role, name, token } = response.data;
      onSubmit(role, name, token, email);
      setShowLogin(false);
    } catch (err) {
      console.log('Login error details:', err.response?.data || err.message); // Debug log
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-center mb-8">
          <img src={intuteLogo} alt="Intute AI Logo" className="h-24" />
        </div>
        {error && (
          <div className="text-red-500 text-base text-center mb-6 font-medium bg-red-50 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full mb-6 px-5 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          disabled={loading}
        />
        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-5 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder-gray-400 pr-12 transition-all duration-200 shadow-sm hover:shadow-md"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <button
            onClick={handleReset}
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg text-gray-800 bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;