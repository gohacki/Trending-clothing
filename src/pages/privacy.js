// src/pages/privacy.js

import Head from "next/head";
import Link from "next/link";

function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Trending Clothing</title>
      </Head>
      <div className="max-w-6xl mx-auto p-8 text-gray-300">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          {/* Add your Privacy Policy content here */}
          Your privacy is important to us. This Privacy Policy outlines the types of personal information we collect, how we use it, and the choices you have regarding your information.
        </p>
        {/* Continue with sections like Data Collection, Data Usage, Data Sharing, etc. */}
      </div>
    </>
  );
}

export default PrivacyPolicy;