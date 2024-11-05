// src/components/EditItemModal.js

import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

function EditItemModal({ item, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    type: item.type,
    gender: item.gender,
    price: item.price,
    style: item.style,
    buyNowLinks: item.buyNowLinks || [{ siteName: '', url: '' }],
    image: null, // For new image upload
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);

  const { name, description, type, gender, price, style, buyNowLinks, image } = formData;

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
    if (!name || !description || !type || !gender || !price || !style) {
      toast.error('All fields are required.');
      return;
    }

    // Validate Buy Now Links
    for (let i = 0; i < buyNowLinks.length; i++) {
      const link = buyNowLinks[i];
      if (!link.siteName || !link.url) {
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
        toast.error(`Invalid URL format in Buy Now link ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('name', name);
      form.append('description', description);
      form.append('type', type);
      form.append('gender', gender);
      form.append('price', price);
      form.append('style', style);
      form.append('buyNowLinks', JSON.stringify(buyNowLinks));

      if (image) {
        form.append('image', image);
      }

      const res = await fetch(`/api/admin/items/${item._id}/edit`, {
        method: 'PUT',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Something went wrong.');
      } else {
        toast.success(data.message || 'Item updated successfully!');
        onUpdate(data.data); // Callback to parent component
        onClose();
      }
    } catch (error) {
      console.error("Error editing item:", error);
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Item</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Item Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">Item Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Stylish Jacket"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Provide a detailed description of the item."
              rows="4"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 dark:text-gray-300 mb-2">Item Image</label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleChange}
              ref={imageInputRef}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {item.image && !image && (
              <p className="text-gray-500 mt-2">Current Image:</p>
            )}
            {item.image && !image && (
              <div className="relative w-32 h-32 mt-2">
                <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
              </div>
            )}
          </div>

          {/* Buy Now Links */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Buy Now Links (Up to 4)</label>
            {buyNowLinks.map((link, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  name={`buyNowLinks-${index}-siteName`}
                  value={link.siteName}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Site Name"
                  required
                />
                <input
                  type="url"
                  name={`buyNowLinks-${index}-url`}
                  value={link.url}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
            <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 mb-2">Type of Clothing</label>
            <select
              name="type"
              id="type"
              value={type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
            <label htmlFor="gender" className="block text-gray-700 dark:text-gray-300 mb-2">Gender</label>
            <select
              name="gender"
              id="gender"
              value={gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
            <select
              name="price"
              id="price"
              value={price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="Under $50">Under $50</option>
              <option value="$50-$100">$50-$100</option>
              <option value="Over $100">Over $100</option>
            </select>
          </div>

          {/* Style */}
          <div className="mb-6">
            <label htmlFor="style" className="block text-gray-700 dark:text-gray-300 mb-2">Style</label>
            <select
              name="style"
              id="style"
              value={style}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Item'}
          </button>
        </form>

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditItemModal;