import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";

export default function Search() {
  const { booksById } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  // Convert booksById object to array
  const allBooks = useMemo(() => Object.values(booksById), [booksById]);

  // Filter only by book title
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return allBooks;
    const query = searchQuery.toLowerCase();
    return allBooks.filter((book) =>
      book.title?.toLowerCase().includes(query)
    );
  }, [allBooks, searchQuery]);

  return (
    <motion.div
      className="search-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="search-header">
        <h1 className="page-title">Search Books</h1>
        <p className="page-subtitle">
          Discover your next favorite book from Hundreds of amazing stories
        </p>
      </div>

      {/* Search Bar */}
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

      {/* Search Results */}
      <div className="search-results">
        <div className="results-header">
          <h2>
            {searchQuery
              ? `${filteredBooks.length} result${
                  filteredBooks.length !== 1 ? "s" : ""
                } for "${searchQuery}"`
              : `${filteredBooks.length} book${
                  filteredBooks.length !== 1 ? "s" : ""
                } available`}
          </h2>
        </div>

        {/* No Results */}
        {filteredBooks.length === 0 && searchQuery && (
          <motion.div className="no-results">
            <h3>No books found</h3>
          </motion.div>
        )}

        {/* Books Grid */}
        {filteredBooks.length > 0 && (
          <motion.div className="books-grid" layout>
            {filteredBooks.map((book) => (
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
