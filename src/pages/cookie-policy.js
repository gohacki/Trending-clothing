// src/pages/cookie-policy.js

import Head from "next/head";
import Link from "next/link";

function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy | Trending Clothing</title>
      </Head>
      <div className="max-w-6xl mx-auto p-8 text-gray-300">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="mb-4">
          {/* Add your Cookie Policy content here */}
          This Cookie Policy explains how Trending Clothing uses cookies and similar technologies to recognize you when you visit our website.
        </p>
        {/* Continue with sections like What Are Cookies, How We Use Cookies, Your Choices, etc. */}
      </div>
    </>
  );
}

export default CookiePolicy;