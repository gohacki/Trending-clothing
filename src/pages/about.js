// src/pages/about.js

import Head from "next/head";

function About() {
  return (
    <>
      <Head>
        <title>About Us | Trending Clothing</title>
      </Head>
      <div className="max-w-6xl mx-auto p-8 text-gray-300">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="mb-4">
          {/* Add your About Us content here */}
          Trending Clothing is dedicated to showcasing the latest and most popular clothing items from around the world. Our mission is to connect fashion enthusiasts with trending products that suit their style and preferences.
        </p>
        {/* Continue with sections about your company, mission, vision, team, etc. */}
      </div>
    </>
  );
}

export default About;