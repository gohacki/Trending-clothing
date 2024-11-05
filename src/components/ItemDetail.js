// src/pages/item/[id].js

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import dbConnect from "../../lib/mongoose";
import Item from "../../models/Item";
import Head from "next/head";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ItemDetailPage({ item }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [inWardrobe, setInWardrobe] = useState(false);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [votes, setVotes] = useState(item.votes);
  const [isVoting, setIsVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch the user's wardrobe to check if the item is already there
      const fetchWardrobe = async () => {
        try {
          const res = await fetch('/api/wardrobe');
          const data = await res.json();
          if (res.ok) {
            const wardrobeIds = data.data.map(wItem => wItem._id);
            setInWardrobe(wardrobeIds.includes(item._id));
          }
        } catch (error) {
          console.error("Error fetching wardrobe:", error);
        }
      };
      fetchWardrobe();
    } else {
      // For unauthenticated users, you might skip wardrobe functionality
      setInWardrobe(false);
    }

    // Initialize FingerprintJS
    FingerprintJS.load().then(fp => fp.get()).then(result => {
      setFingerprint(result.visitorId);
    });
  }, [isAuthenticated, item._id]);

  const handleWardrobeToggle = async () => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to manage your wardrobe.");
      return;
    }

    setWardrobeLoading(true);

    try {
      if (inWardrobe) {
        // Remove from wardrobe
        const res = await fetch(`/api/wardrobe/${item._id}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (res.ok) {
          setInWardrobe(false);
          toast.success(data.message || 'Item removed from wardrobe.');
        } else {
          toast.error(data.message || 'Failed to remove item.');
        }
      } else {
        // Add to wardrobe
        const res = await fetch('/api/wardrobe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId: item._id }),
        });

        const data = await res.json();

        if (res.ok) {
          setInWardrobe(true);
          toast.success(data.message || 'Item added to wardrobe.');
        } else {
          toast.error(data.message || 'Failed to add item.');
        }
      }
    } catch (error) {
      console.error("Error toggling wardrobe:", error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setWardrobeLoading(false);
    }
  };

  const handleVote = async () => {
    if (isVoting) return;

    setIsVoting(true);

    try {
      const payload = {
        ...(isAuthenticated ? {} : { fingerprint }),
      };

      const res = await fetch(`/api/items/${item._id}/vote`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const { success, data, message } = await res.json();

      if (success) {
        setVotes(data.votes);
        toast.success('Vote registered successfully!');
      } else {
        toast.error(message || 'Failed to vote.');
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("An error occurred while voting. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-gradient text-gray-300">
        <p className="text-xl mb-4">Item not found</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>{item.name} | Trending Clothing</title>
        <meta name="description" content={item.description} />
      </Head>
      <div className="item-detail-page max-w-3xl mx-auto p-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 text-blue-500 hover:text-blue-700 underline"
        >
          &larr; Back
        </button>

        <h1 className="text-3xl font-bold mb-4">{item.name}</h1>
        <div className="relative w-full h-96 mb-4">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded"
            sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
            priority // Ensures this image loads quickly
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/fallback-image.png';
            }}
          />
        </div>
        <p className="text-gray-300 mb-4">{votes} votes</p>
        {/* Affiliate link */}
        <a
          href={item.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-600 underline"
        >
          Buy Now
        </a>

        {/* Vote Button */}
        <div className="mt-4">
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
              isVoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            aria-label={isVoting ? "Voting" : "Upvote"}
          >
            {isVoting ? "Voting..." : "Upvote"}
          </button>
          <span className="ml-3 text-lg text-gray-300">{votes} votes</span>
        </div>

        {/* Wardrobe Button */}
        <div className="mt-4">
          <button
            onClick={handleWardrobeToggle}
            disabled={wardrobeLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              wardrobeLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            aria-label={inWardrobe ? "Remove from Wardrobe" : "Add to Wardrobe"}
          >
            {wardrobeLoading ? "Processing..." : inWardrobe ? "Remove from Wardrobe" : "Add to Wardrobe"}
          </button>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  await dbConnect();

  try {
    const item = await Item.findById(id).lean();

    if (!item) {
      return {
        props: { item: null },
      };
    }

    // Convert Mongoose _id and Date fields to strings
    item._id = item._id.toString();
    item.createdAt = item.createdAt.toISOString();
    item.updatedAt = item.updatedAt.toISOString();
    // Repeat for any other Date fields if present

    return {
      props: { item },
    };
  } catch (error) {
    console.error("Error fetching item:", error);
    return {
      props: { item: null },
    };
  }
}

export default ItemDetailPage;