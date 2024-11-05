// src/pages/admin/submissions.js

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

function AdminSubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push('/auth/signin');
      } else if (session.user.role !== 'admin') {
        router.push('/');
      } else {
        fetchSubmissions();
      }
    }
  }, [isLoading, session, router]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions');
      const data = await res.json();

      if (res.ok) {
        setSubmissions(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch submissions.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching submissions.');
    }
  };

  const handleDecision = async (itemId, decision) => {
    try {
      let affiliateLink = '';
      let type = '';
      let gender = '';
      let price = '';
      let style = '';

      if (decision === 'approve') {
        // Prompt admin for affiliate link and new fields
        affiliateLink = prompt('Please enter the affiliate link for this item:');
        if (!affiliateLink) {
          toast.error('Affiliate link is required to approve the item.');
          return;
        }

        type = prompt('Enter the type of clothing (Shirt, Pants, Jacket, Dress, Shoes, Accessories):');
        if (!['Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Accessories'].includes(type)) {
          toast.error('Invalid type of clothing.');
          return;
        }

        gender = prompt('Enter the gender (Male, Female, Unisex):');
        if (!['Male', 'Female', 'Unisex'].includes(gender)) {
          toast.error('Invalid gender.');
          return;
        }

        price = prompt('Enter the price range (Under $50, $50-$100, Over $100):');
        if (!['Under $50', '$50-$100', 'Over $100'].includes(price)) {
          toast.error('Invalid price range.');
          return;
        }

        style = prompt('Enter the style (Casual, Formal, Sport, Vintage, Streetwear):');
        if (!['Casual', 'Formal', 'Sport', 'Vintage', 'Streetwear'].includes(style)) {
          toast.error('Invalid style.');
          return;
        }
      }

      const body = decision === 'approve' ? { affiliateLink, type, gender, price, style } : {};

      const res = await fetch(`/api/admin/submissions/${itemId}/${decision}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Item ${decision}d successfully!`);
        // Remove the item from the list
        setSubmissions(submissions.filter((item) => item._id !== itemId));
      } else {
        toast.error(data.message || `Failed to ${decision} item.`);
      }
    } catch (error) {
      toast.error(`An error occurred while trying to ${decision} the item.`);
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/items/${itemId}/remove`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Item removed successfully!');
        // Remove the item from the list
        setSubmissions(submissions.filter((item) => item._id !== itemId));
      } else {
        toast.error(data.message || 'Failed to remove item.');
      }
    } catch (error) {
      toast.error('An error occurred while removing the item.');
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Admin - Review Submissions | Trending Clothing</title>
      </Head>
      <div className="admin-submissions-page flex flex-col items-center p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white">Pending Item Submissions</h1>
        <Link href="/admin/add-item" className="mb-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
            Add New Item
        </Link>
        {submissions.length > 0 ? (
          submissions.map((item) => (
            <div key={item._id} className="submission-card flex items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-md shadow-md rounded p-4 mb-4 w-full max-w-4xl transition-colors duration-300 dark:bg-gray-700">
              {/* Item Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="rounded object-cover" />
              </div>

              {/* Item Details */}
              <div className="ml-4 flex-grow">
                <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                <p className="text-gray-300">{item.description}</p>
                <p className="text-gray-300">Purchase Links:</p>
                <ul className="list-disc list-inside text-gray-300">
                  {item.links.map((link, index) => (
                    <li key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleDecision(item._id, 'approve')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(item._id, 'reject')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Reject
                </button>
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item._id)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No pending submissions.</p>
        )}
        <ToastContainer />
      </div>
    </>
  );
}

export default AdminSubmissionsPage;