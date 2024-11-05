// src/pages/contact.js

import Head from "next/head";

function ContactUs() {
  return (
    <>
      <Head>
        <title>Contact Us | Trending Clothing</title>
      </Head>
      <div className="max-w-6xl mx-auto p-8 text-gray-300">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="mb-4">
          {/* Add your Contact Us content here */}
          If you have any questions, concerns, or feedback, please feel free to reach out to us at:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Email: support@trendingclothing.com</li>
          <li>Phone: +1 (234) 567-8901</li>
          <li>Address: 123 Fashion Ave, New York, NY 10001</li>
        </ul>
        {/* Optionally, add a contact form */}
      </div>
    </>
  );
}

export default ContactUs;