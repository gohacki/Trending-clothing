// src/components/Navbar.js

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevents hydration mismatch

  return (
    <nav className="w-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-4 flex justify-between items-center shadow-md dark:bg-gray-800 dark:bg-opacity-80">
      <Link href="/">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Trending Clothing</h1>
      </Link>
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
        {session && (
          <>
            <Link href="/submit" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                Submit Item
            </Link>
            <Link href="/wardrobe" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                My Wardrobe
            </Link>
            {session.user.role === "admin" && (
              <>
                <Link href="/admin/submissions" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    Admin Submissions
                </Link>
                <Link href="/admin/add-item" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    Add Item
                </Link>
              </>
            )}
          </>
        )}

        {!isLoading && !session && (
          <>
            <Link href="/auth/signin" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                Sign In
            </Link>
            <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                Register
            </Link>
          </>
        )}

        {!isLoading && session && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-800 dark:text-gray-200">Hello, {session.user.name}</span>
            <button
              onClick={() => signOut()}
              className= "text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;