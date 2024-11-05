// src/components/AdminAddItemPage.js

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
    image: null,
    type: 'Shirt', // Default value
    gender: 'Unisex', // Default value
    price: 'Under $50', // Default value
    style: 'Casual', // Default value
    buyNowLinks: [{ siteName: '', url: '' }], // Initialize with one empty link
  });

  const [error, setError] = useState('');
  const imageInputRef = useRef(null); // Ref for the image input

  const { name, description, type, gender, price, style, buyNowLinks } = formData;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith('buyNowLinks')) {
      const [_, index, field] = name.split('-'); // e.g., buyNowLinks-0-siteName
      const updatedLinks = [...buyNowLinks];
      updatedLinks[index][field] = value;
      setFormData({ ...formData, buyNowLinks: updatedLinks });
    } else if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const addBuyNowLink = () => {
    if (buyNowLinks.length >= 4) return;
    setFormData({
      ...formData,
      buyNowLinks: [...buyNowLinks, { siteName: '', url: '' }],
    });
  };

  const removeBuyNowLink = (index) => {
    const updatedLinks = buyNowLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, buyNowLinks: updatedLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end validation
    if (!name || !description || !formData.image || !type || !gender || !price || !style) {
      setError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }

    // Validate Buy Now Links
    for (let i = 0; i < buyNowLinks.length; i++) {
      const link = buyNowLinks[i];
      if (!link.siteName || !link.url) {
        setError(`All Buy Now links must have a site name and URL.`);
        toast.error(`All Buy Now links must have a site name and URL.`);
        return;
      }
      // Basic URL validation
      const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})'+ // domain name
        '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*'+ // port and path
        '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-zA-Z\\d_]*)?$','i');
      if (!urlPattern.test(link.url)) {
        setError(`Invalid URL format in Buy Now link ${i + 1}.`);
        toast.error(`Invalid URL format in Buy Now link ${i + 1}.`);
        return;
      }
    }

    // Prepare form data
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('type', type);
    form.append('gender', gender);
    form.append('price', price);
    form.append('style', style);
    form.append('image', formData.image);
    // Append buyNowLinks as JSON string
    form.append('buyNowLinks', JSON.stringify(buyNowLinks));

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
          image: null,
          type: 'Shirt',
          gender: 'Unisex',
          price: 'Under $50',
          style: 'Casual',
          buyNowLinks: [{ siteName: '', url: '' }],
        });
        // Clear the file input
        if (imageInputRef.current) {
          imageInputRef.current.value = null;
        }
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-filter backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">Add a New Item</h2>
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
                value={name}
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
                value={description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="Provide a detailed description of the item."
                rows="4"
                required
              ></textarea>
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
                ref={imageInputRef} // Attach ref to clear input later
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              />
            </div>

            {/* Buy Now Links */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Buy Now Links (Up to 4)
              </label>
              {buyNowLinks.map((link, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    name={`buyNowLinks-${index}-siteName`}
                    value={link.siteName}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                    placeholder="Site Name"
                    required
                  />
                  <input
                    type="url"
                    name={`buyNowLinks-${index}-url`}
                    value={link.url}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                    placeholder="https://example.com/product"
                    required
                  />
                  {buyNowLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBuyNowLink(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg"
                      aria-label={`Remove Buy Now link ${index + 1}`}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              {buyNowLinks.length < 4 && (
                <button
                  type="button"
                  onClick={addBuyNowLink}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Add Buy Now Link
                </button>
              )}
            </div>

            {/* Type of Clothing */}
            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Type of Clothing
              </label>
              <select
                name="type"
                id="type"
                value={type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              >
                <option value="Shirt">Shirt</option>
                <option value="Pants">Pants</option>
                <option value="Jacket">Jacket</option>
                <option value="Dress">Dress</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label htmlFor="gender" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Price Range
              </label>
              <select
                name="price"
                id="price"
                value={price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              >
                <option value="Under $50">Under $50</option>
                <option value="$50-$100">$50-$100</option>
                <option value="Over $100">Over $100</option>
              </select>
            </div>

            {/* Style */}
            <div className="mb-6">
              <label htmlFor="style" className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Style
              </label>
              <select
                name="style"
                id="style"
                value={style}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                required
              >
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Sport">Sport</option>
                <option value="Vintage">Vintage</option>
                <option value="Streetwear">Streetwear</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
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