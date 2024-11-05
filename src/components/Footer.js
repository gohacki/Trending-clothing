// src/components/Footer.js

import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-4 mt-auto shadow-inner dark:bg-gray-800 dark:bg-opacity-80">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo or Site Name */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Trending Clothing</h2>
        </div>

        {/* Legal Links */}
        <div className="flex space-x-4">
          <Link href="/privacy" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Terms of Service
          </Link>
          <Link href="/cookie-policy" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Cookie Policy
          </Link>
          <Link href="/contact" className="text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Contact Us
          </Link>
        </div>
      </div>
      {/* Optional: Copyright */}
      <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Trending Clothing. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;