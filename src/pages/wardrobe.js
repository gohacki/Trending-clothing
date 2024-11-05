// src/pages/wardrobe.js

import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]"; // Adjust the path as needed
import dbConnect from "../lib/mongoose";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";

function WardrobePage({ wardrobeItems }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const router = useRouter();
  const [wardrobe, setWardrobe] = useState(wardrobeItems);

  const handleRemove = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item from your wardrobe?')) {
      return;
    }

    try {
      const res = await fetch(`/api/wardrobe/${itemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Item removed successfully!');
        // Update the wardrobe state
        setWardrobe(wardrobe.filter(item => item._id !== itemId));
      } else {
        toast.error(data.message || 'Failed to remove item.');
      }
    } catch (error) {
      console.error("Error removing item from wardrobe:", error);
      toast.error('An error occurred while removing the item.');
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-gradient">
        <p className="text-gray-300 mb-4">You must be signed in to view your wardrobe.</p>
        <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
            Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Wardrobe | Trending Clothing</title>
      </Head>
      <div className="wardrobe-page flex flex-col items-center p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white">My Wardrobe</h1>
        {wardrobe.length > 0 ? (
          wardrobe.map((item) => (
            <div key={item._id} className="wardrobe-item flex items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-md shadow-md rounded p-4 mb-4 w-full max-w-4xl">
              {/* Item Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="rounded object-cover" />
              </div>

              {/* Item Details */}
              <div className="ml-4 flex-grow">
                <Link href={`/item/${item._id}`} className="text-xl font-semibold text-white hover:underline">
                  {item.name}
                </Link>
                <p className="text-gray-300">{item.description}</p>
              </div>

              {/* Remove Button */}
              <div className="ml-4">
                <button
                  onClick={() => handleRemove(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">Your wardrobe is empty. Start adding some items!</p>
        )}
        <ToastContainer />
      </div>
    </>
  );
}

// Updated getServerSideProps
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: { wardrobeItems: [] },
    };
  }

  await dbConnect();

  // Dynamically import User model to prevent client-side bundling
  const User = await import("../models/User").then((mod) => mod.default);

  try {
    const user = await User.findById(session.user.id).populate('wardrobe').lean();

    if (!user) {
      return {
        props: { wardrobeItems: [] },
      };
    }

    const wardrobeItems = (user.wardrobe || []).map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    }));

    return {
      props: { wardrobeItems },
    };
  } catch (error) {
    console.error('Error fetching wardrobe:', error);
    return {
      props: { wardrobeItems: [] },
    };
  }
}

export default WardrobePage;