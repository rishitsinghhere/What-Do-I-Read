import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { getAllGenres, getBooksByGenres } from "../services/api";

export default function SelectGenres() {
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]); // Start with an empty array of books
  const [selected, setSelected] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false); // Separate loading state for books

  const toggle = (id) => {
    const newSelection = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
      
    console.log("1. Component State Updated:", newSelection); // <-- ADD THIS LOG
    setSelected(newSelection);
  };

  // This useEffect fetches books ONLY when the `selected` genres change
  useEffect(() => {
    const fetchBooks = async () => {
      // If no genres are selected, just show an empty list.
      if (selected.length === 0) {
        setBooks([]);
        return;
      }

      setIsLoadingBooks(true);
      try {
        const fetchedBooks = await getBooksByGenres(selected);
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selected]); // This is the crucial part: it re-runs ONLY when `selected` changes

  // This useEffect runs only ONCE to fetch the list of available genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await getAllGenres();
        setGenres(fetchedGenres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);

  return (
    <>
      <div className="container-selectgenres">
        <h2 style={{ margin: "10px 0 8px" }}>Select Genres</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Pick one or many
        </p>
        <hr style={{ marginTop: 40, borderColor: "transparent" }} />
        <div className="row" style={{ marginBottom: 14 }}>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`btn ${selected.includes(g.id) ? "primary" : ""}`}
            >
              {g.name}
            </button>
          ))}
          <button className="btn-clear" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
        <hr
          style={{
            marginTop: 50,
            marginBottom: 50,
            borderColor: "#333",
            borderWidth: "2px",
          }}
        />
        <div className="grid grid-5">
          {isLoadingBooks ? (
            <p>Loading books...</p>
          ) : books.length > 0 ? (
            books.map((b) => <BookCard key={b.id} book={b} />)
          ) : (
            <p>Select a genre to see matching books.</p>
          )}
        </div>
      </div>
    </>
  );
}