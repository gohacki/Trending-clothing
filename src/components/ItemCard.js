// src/components/ItemCard.js

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import ReCAPTCHA from 'react-google-recaptcha';

function ItemCard({ item, searchTerm, wardrobeIds }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [inWardrobe, setInWardrobe] = useState(isAuthenticated ? wardrobeIds.includes(item._id) : false);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [votes, setVotes] = useState(item.votes);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For skeleton loader
  const [fingerprint, setFingerprint] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [hasVoted, setHasVoted] = useState(false); // Define hasVoted state
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Initialize FingerprintJS
    FingerprintJS.load().then(fp => fp.get()).then(result => {
      setFingerprint(result.visitorId);
    });

    // Check if the user has already voted for this item
    const checkHasVoted = async () => {
      try {
        const res = await fetch(`/api/items/${item._id}/hasVoted`);
        const data = await res.json();
        if (res.ok) {
          setHasVoted(data.hasVoted);
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkHasVoted();
  }, [item._id]);

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
    if (isVoting || hasVoted) return;

    setIsVoting(true);

    try {
      if (!isAuthenticated && recaptchaRef.current) {
        const token = await recaptchaRef.current.executeAsync();
        setCaptchaToken(token);
        recaptchaRef.current.reset();
      }

      const payload = {
        ...(isAuthenticated ? {} : { captchaToken }),
        ...(fingerprint ? { fingerprint } : {}),
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
        setHasVoted(true); // Update hasVoted state
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

  // Render skeleton if loading
  if (isLoading) {
    return (
      <div className="item-card flex flex-col md:flex-row items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-md shadow-lg rounded-lg p-6 mb-6 w-full max-w-4xl">
        <div className="relative w-full md:w-1/3 h-48 flex-shrink-0">
          <Skeleton height="100%" width="100%" />
        </div>
        <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
          <Skeleton height={30} width="80%" />
          <Skeleton count={2} className="mt-2" />
          <div className="mt-4 flex flex-wrap items-center space-x-4">
            <Skeleton height={40} width={100} />
            <Skeleton height={40} width={100} />
            <Skeleton height={40} width={100} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="item-card flex flex-col md:flex-row items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-md shadow-lg rounded-lg p-6 mb-6 w-full max-w-4xl transform transition duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-700">
        {/* Item Image */}
        <div className="relative w-full md:w-1/3 h-48 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={item.image} // CDN URL
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>

        {/* Item Details */}
        <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
          <Link href={`/item/${item._id}`} className="text-2xl font-semibold text-gray-800 dark:text-white hover:underline">
              {searchTerm ? (
                <HighlightText text={item.name} highlight={searchTerm} />
              ) : (
                item.name
              )}
          </Link>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>
          <div className="mt-4 flex flex-wrap items-center space-x-4">
            {/* Upvote Button and Vote Count */}
            <div className="flex items-center">
              <button
                onClick={handleVote}
                disabled={isVoting || hasVoted}
                className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 ${
                  (isVoting || hasVoted) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                aria-label={isVoting ? "Voting" : "Upvote"}
              >
                {isVoting ? "Voting..." : hasVoted ? "Voted" : "Upvote"}
              </button>
              <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">{votes} votes</span>
            </div>

            {/* Buy Now Button */}
            <a
              href={item.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Buy Now
            </a>

            {/* Wardrobe Button */}
            <button
              onClick={handleWardrobeToggle}
              disabled={wardrobeLoading}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 ${
                wardrobeLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-label={inWardrobe ? "Remove from Wardrobe" : "Add to Wardrobe"}
            >
              {wardrobeLoading ? "Processing..." : inWardrobe ? "Remove" : "Add"}
            </button>
          </div>
        </div>
      </div>
      {/* Invisible reCAPTCHA */}
      {!isAuthenticated && (
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          size="invisible"
          ref={recaptchaRef}
        />
      )}
      <ToastContainer />
    </>
  );
}

// Component to highlight search terms
function HighlightText({ text, highlight }) {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-300 text-black">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default ItemCard;