// src/pages/submit.js

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

function SubmitItemPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    links: '',
    image: null,
  });

  const [error, setError] = useState('');
  const [fingerprint, setFingerprint] = useState(null);

  useEffect(() => {
    // Initialize FingerprintJS
    FingerprintJS.load().then(fp => fp.get()).then(result => {
      setFingerprint(result.visitorId);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end validation
    if (!formData.name || !formData.description || !formData.links || !formData.image) {
      setError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }

    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('links', formData.links); // Comma-separated URLs
    form.append('image', formData.image);

    try {
      const res = await fetch('/api/items/submit', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        toast.error(data.message || 'Something went wrong.');
      } else {
        toast.success(data.message || 'Item submitted successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          links: '',
          image: null,
        });
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong.');
      toast.error('Something went wrong.');
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <p className="text-gray-700 dark:text-gray-300 mb-4">You must be signed in to submit items.</p>
        <Link href="/auth/signin">
          <a className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
            Sign In
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Submit Item | Trending Clothing</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-filter backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">Submit a New Item</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Item Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="Stylish Jacket"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="Provide a detailed description of the item."
                rows="4"
                required
              ></textarea>
            </div>

            {/* Purchase Links */}
            <div className="mb-4">
              <label htmlFor="links" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Purchase Links (comma-separated)
              </label>
              <input
                type="text"
                name="links"
                id="links"
                value={formData.links}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="https://store1.com/item, https://store2.com/item"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label htmlFor="image" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Item Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Submit Item
            </button>
          </form>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default SubmitItemPage;