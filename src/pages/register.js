// src/pages/register.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { username, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple front-end validation
    if (!username || !email || !password) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        toast.error(data.message || 'Something went wrong.');
      } else {
        toast.success('Registered successfully! Redirecting to sign in...');
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong.');
      toast.error('Something went wrong.');
    }
  };

  return (
    <>
      <Head>
        <title>Register | Trending Clothing</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-filter backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">Register</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="john_doe"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-gray-700 dark:text-gray-300 text-center transition-colors duration-300">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-400 dark:text-blue-600 hover:text-blue-600 dark:hover:text-blue-700 underline transition-colors duration-300">
                Sign In
            </Link>
          </p>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default RegisterPage;