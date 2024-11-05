// src/pages/auth/signin.js

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { username, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple front-end validation
    if (!username || !password) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }

    // Sign in using Credentials Provider
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res.error) {
      setError(res.error);
      toast.error(res.error);
    } else {
      toast.success("Signed in successfully!");
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Trending Clothing</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-filter backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">Sign In</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {/* Credentials Sign-In Form */}
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
              className="w-full bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Sign In
            </button>
          </form>

          {/* Remove OAuth Providers Section */}

          <p className="mt-6 text-gray-700 dark:text-gray-300 text-center transition-colors duration-300">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 dark:text-blue-600 hover:text-blue-600 dark:hover:text-blue-700 underline transition-colors duration-300">
                Register
            </Link>
          </p>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default SignInPage;