import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Pastikan untuk menginstal framer-motion
import { FaUser, FaLock } from 'react-icons/fa'; // Menggunakan ikon untuk input

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Mulai loading
    setError('');

    // Simulasi delay untuk loading
    setTimeout(() => {
      if (username === 'username admin' && password === '**********') {
        setShowLogin(false);
        setIsUnlocked(true);
        setTimeout(() => {
          onLogin();
        }, 1500);
      } else {
        setError('Username atau Password salah!');
      }
      setLoading(false); // Selesai loading
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-400 via-red-300 to-yellow-200">
      <h1 className="text-5xl font-bold text-white mb-5">Login</h1>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-red-500 mb-4"
        >
          {error}
        </motion.p>
      )}

      {showLogin ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-80">
          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
            />
          </div>
          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
            />
          </div>
          <button
            type="submit"
            className={`bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      ) : null}

      {/* Animasi Gembok yang Terbuka */}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-center"
        >
          <h2 className="text-2xl mt-2 text-white">Selamat Datang! ❤️</h2>
        </motion.div>
      )}
    </div>
  );
};

export default LoginPage;
