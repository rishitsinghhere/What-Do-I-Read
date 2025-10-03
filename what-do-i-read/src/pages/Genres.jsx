import { useState, useEffect } from "react";
import GenreCard from "../components/GenreCard";
import BookCard from "../components/BookCard";
// Change #1: Import the new, more specific API function
import { getGenresWithBookPreviews } from "../services/api";

export default function Genres() {
  // Change #2: State is simpler. We only need to store the genres.
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Change #3: Fetching logic is now a single, efficient API call
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

  // The JSX below is the same, but now uses the `bookPreviews`
  // array that comes directly from the API.
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