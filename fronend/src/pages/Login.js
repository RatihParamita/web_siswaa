import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUniversity } from 'react-icons/fa'; // Contoh ikon

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State untuk loading
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie');
            const response = await axios.post('http://localhost:8000/api/login', {
                email: email,
                password: password,
            });
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('user_name', response.data.user.name);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Email atau Password salah.');
            } else {
                setError('Terjadi kesalahan pada server. Coba lagi nanti.');
                console.error("Login error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <FaUniversity className="mx-auto h-12 w-auto text-blue-900" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Login Admin
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masuk untuk mengakses dashboard
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Alamat Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Loading...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;