// src/pages/index.js

import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import { useSession } from "next-auth/react";

function HomePage() {
  const [items, setItems] = useState([]);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [wardrobeIds, setWardrobeIds] = useState([]);

  // New state variables for filters
  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Added searchTerm

  // Fetch items from the backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        let query = '/api/items?status=approved';

        // Append filters to query if set
        if (typeFilter) query += `&type=${encodeURIComponent(typeFilter)}`;
        if (genderFilter) query += `&gender=${encodeURIComponent(genderFilter)}`;
        if (priceFilter) query += `&price=${encodeURIComponent(priceFilter)}`;
        if (styleFilter) query += `&style=${encodeURIComponent(styleFilter)}`;

        // Append search term if set
        if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(query);
        const { success, data } = await res.json();
        if (success) {
          // Sort items by votes in descending order
          const sortedItems = data.sort((a, b) => b.votes - a.votes);
          setItems(sortedItems);
          // No need to setFilteredItems if the API handles filtering
        } else {
          console.error("Failed to fetch items.");
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [typeFilter, genderFilter, priceFilter, styleFilter, searchTerm]);

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

  // Handle reset filters
  const resetFilters = () => {
    setTypeFilter('');
    setGenderFilter('');
    setPriceFilter('');
    setStyleFilter('');
    setSearchTerm(''); // Reset searchTerm
  };

  return (
    <div className="home-page flex flex-col items-center p-4 min-h-screen">
      {/* Search and Filter Bar */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search for items..."
          value={searchTerm} // Bind to searchTerm state
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input
          className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
        />

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">All Types</option>
          <option value="Shirt">Shirt</option>
          <option value="Pants">Pants</option>
          <option value="Jacket">Jacket</option>
          <option value="Dress">Dress</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">Accessories</option>
        </select>

        {/* Gender Filter */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unisex">Unisex</option>
        </select>

        {/* Price Filter */}
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">All Prices</option>
          <option value="Under $50">Under $50</option>
          <option value="$50-$100">$50-$100</option>
          <option value="Over $100">Over $100</option>
        </select>

        {/* Style Filter */}
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">All Styles</option>
          <option value="Casual">Casual</option>
          <option value="Formal">Formal</option>
          <option value="Sport">Sport</option>
          <option value="Vintage">Vintage</option>
          <option value="Streetwear">Streetwear</option>
        </select>

        {/* Reset Filters Button */}
        <button
          onClick={resetFilters}
          className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-300"
        >
          Reset
        </button>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        items.map((item, index) => (
          <ItemCard
            key={item._id}
            item={item}
            rank={index + 1} // Pass rank as index + 1
            searchTerm={searchTerm} // Pass the actual searchTerm
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