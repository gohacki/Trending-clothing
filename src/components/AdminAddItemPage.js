import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminAddItemPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    affiliateLink: '',
    links: '',
    image: null,
  });

  const [error, setError] = useState('');

  const { name, description, affiliateLink, links, image } = formData;

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
    if (!name || !description || !affiliateLink || !links || !image) {
      setError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }

    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('affiliateLink', affiliateLink);
    form.append('links', links); // Comma-separated URLs
    form.append('image', image);

    try {
      const res = await fetch('/api/admin/items/add', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        toast.error(data.message || 'Something went wrong.');
      } else {
        toast.success(data.message || 'Item added successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          affiliateLink: '',
          links: '',
          image: null,
        });
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/submissions');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-gradient">
        <p className="text-gray-300 mb-4">You must be signed in to access this page.</p>
        <Link href="/auth/signin">
          <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
            Sign In
          </a>
        </Link>
      </div>
    );
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-gradient">
        <p className="text-gray-300 mb-4">You do not have permission to access this page.</p>
        <Link href="/">
          <a className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
            Go Home
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add Item | Trending Clothing</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-dark-gradient">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Add a New Item</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Item Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 mb-2">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-black placeholder-gray-300"
                placeholder="Stylish Jacket"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-black placeholder-gray-300"
                placeholder="Provide a detailed description of the item."
                rows="4"
                required
              ></textarea>
            </div>

            {/* Affiliate Link */}
            <div className="mb-4">
              <label htmlFor="affiliateLink" className="block text-gray-300 mb-2">
                Affiliate Link
              </label>
              <input
                type="url"
                name="affiliateLink"
                id="affiliateLink"
                value={affiliateLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-black placeholder-gray-300"
                placeholder="https://www.example.com/product"
                required
              />
            </div>

            {/* Purchase Links */}
            <div className="mb-4">
              <label htmlFor="links" className="block text-gray-300 mb-2">
                Purchase Links (comma-separated)
              </label>
              <input
                type="text"
                name="links"
                id="links"
                value={links}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-black placeholder-gray-300"
                placeholder="https://store1.com/item, https://store2.com/item"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label htmlFor="image" className="block text-gray-300 mb-2">
                Item Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-black"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add Item
            </button>
          </form>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default AdminAddItemPage;