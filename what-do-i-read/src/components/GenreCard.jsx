// in /src/components/GenreCard.jsx

import { Link } from "react-router-dom";
// --- CHANGE #1: All imports for fetching data are now removed ---
// import * as Realm from "realm-web";
// import { useState, useEffect } from "react";
// import { getAnonymousUser } from "../auth";

export default function GenreCard({ genre }) {
  // --- CHANGE #2: The useEffect and useState hooks are no longer needed ---
  // The 'genre' object now contains everything we need directly from the props.
  // The parent component (Genres.jsx) will fetch this enhanced data.

  return (
    <Link
      to={`/books/${genre.id}`}
      className="genre-card"
      style={{
        // --- CHANGE #3: Use the `sampleCover` property from the genre object ---
        backgroundImage: `linear-gradient(180deg, rgba(8,10,14,.15), rgba(8,10,14,.85)), url(${genre.sampleCover})`,
      }}
    >
      {/* Genre Name */}
      <div className="genre-pill">{genre.name}</div>

      {/* Book Count */}
      {/* --- CHANGE #4: Use the `bookCount` property from the genre object --- */}
      <div className="genre-count">{genre.bookCount} books</div>
    </Link>
  );
}