// src/pages/index.js

import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import { useSession } from "next-auth/react";

function HomePage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [wardrobeIds, setWardrobeIds] = useState([]);

  // Fetch items from the backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        const { success, data } = await res.json();
        if (success) {
          // Sort items by votes in descending order
          const sortedItems = data.sort((a, b) => b.votes - a.votes);
          setItems(sortedItems);
          setFilteredItems(sortedItems);
        } else {
          console.error("Failed to fetch items.");
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  // Fetch wardrobe once
  useEffect(() => {
    if (isAuthenticated) {
      const fetchWardrobe = async () => {
        try {
          const res = await fetch('/api/wardrobe');
          const data = await res.json();
          if (res.ok && Array.isArray(data.data)) {
            const wardrobeItemIds = data.data.map(wItem => wItem._id);
            setWardrobeIds(wardrobeItemIds);
          } else {
            console.error("Invalid data structure from wardrobe API:", data);
            setWardrobeIds([]);
          }
        } catch (error) {
          console.error("Error fetching wardrobe:", error);
          setWardrobeIds([]);
        }
      };
      fetchWardrobe();
    } else {
      setWardrobeIds([]);
    }
  }, [isAuthenticated]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  return (
    <div className="home-page flex flex-col items-center p-4 min-h-screen">
      {/* Search Bar */}
      <div className="w-full max-w-4xl mb-6 flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for items..."
          aria-label="Search items"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-white placeholder-gray-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            searchTerm={searchQuery}
            wardrobeIds={wardrobeIds}
          />
        ))
      ) : (
        <p className="text-gray-300">No items found.</p>
      )}
    </div>
  );
}

export default HomePage;