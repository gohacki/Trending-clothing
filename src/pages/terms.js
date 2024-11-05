// src/pages/terms.js

import Head from "next/head";
import Link from "next/link";

function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | Trending Clothing</title>
      </Head>
      <div className="max-w-6xl mx-auto p-8 text-gray-300">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">
          {/* Add your Terms of Service content here */}
          By using the Trending Clothing application, you agree to comply with and be bound by the following terms and conditions.
        </p>
        {/* Continue with sections like User Responsibilities, Prohibited Activities, Termination, etc. */}
      </div>
    </>
  );
}

export default TermsOfService;