// in /src/pages/Search.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import BookCard from "../components/BookCard";
// --- CHANGE #1: Remove LibraryContext, import the new API function ---
import { searchBooks, getAllBooks } from "../services/api";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]); // State to hold search results
  const [isLoading, setIsLoading] = useState(true);

  // --- CHANGE #2: Use useEffect to fetch search results from the API ---
  useEffect(() => {
    // This function fetches either all books (on initial load) or search results
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const results = searchQuery.trim()
          ? await searchBooks(searchQuery)
          : await getAllBooks(); // Show all books initially
        setBooks(results);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce: Wait 300ms after user stops typing before making an API call
    const timerId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timerId); // Cleanup timer on re-render
  }, [searchQuery]); // Rerun effect when the search query changes

  return (
    <motion.div
      className="search-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header (no changes) */}
      <div className="search-header">
        <h1 className="page-title">Search Books</h1>
        <p className="page-subtitle">
          Discover your next favorite book from Hundreds of amazing stories
        </p>
      </div>

      {/* Search Bar (no changes) */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by book title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="clear-search-btn"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* --- CHANGE #3: Update results section to use the new `books` state --- */}
      <div className="search-results">
        <div className="results-header">
          <h2>
            {isLoading
              ? "Searching..."
              : searchQuery
              ? `${books.length} result${
                  books.length !== 1 ? "s" : ""
                } for "${searchQuery}"`
              : `${books.length} book${
                  books.length !== 1 ? "s" : ""
                } available`}
          </h2>
        </div>

        {/* No Results */}
        {books.length === 0 && searchQuery && !isLoading && (
          <motion.div className="no-results">
            <h3>No books found</h3>
          </motion.div>
        )}

        {/* Books Grid */}
        {books.length > 0 && (
          <motion.div className="books-grid" layout>
            {books.map((book) => (
              <motion.div key={book.id} layout whileHover={{ y: -5 }}>
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}