import { useState, useEffect } from "react";
import GenreCard from "../components/GenreCard";
import BookCard from "../components/BookCard";

import { getGenresWithBookPreviews } from "../services/api";

export default function Genres() {

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const genresWithPreviews = await getGenresWithBookPreviews();
        setGenres(genresWithPreviews);
      } catch (err) {
        console.error("Failed to fetch page data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>
  }


  return (
    <div className="container-genres">
      <h1 className="genres-title">Genres</h1>

      <div className="grid grid-4 genres-grid">
        {genres.map((genre) => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </div>

      {genres.map((genre, index) => (
        <section key={genre.id} className="genre-section">
          <div className="row genre-row">
            <h3 className="genre-name">{genre.name}</h3>
            <a className="btn ghost" href={`/books/${genre.id}`}>
              View all
            </a>
          </div>

          <div className="grid grid-5 books-grid">
            {/* Use the `bookPreviews` array provided by the API */}
            {(genre.bookPreviews || []).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {index < genres.length - 1 && <hr className="genre-divider" />}
        </section>
      ))}
    </div>
  );
}