import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { useEffect, useState } from "react";
import { getAnonymousUser } from "../auth";

// BOOKS PAGE - Displays books by genre, organized by series and standalone books

export default function Books() {
  const { genreId } = useParams();
  const [books, setBooks] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [seriesBooks, setSeriesBooks] = useState({});
  const [standaloneBooks, setStandaloneBooks] = useState([]);
  const [seriesData, setSeriesData] = useState({});

  useEffect(() => {
    async function fetchBooks() {
      const user = await getAnonymousUser();

      const mongodb = user.mongoClient("mongodb-atlas");
      const booksCollection = mongodb.db("What-Do-I-Read").collection("books");
      const genresCollection = mongodb
        .db("What-Do-I-Read")
        .collection("genres");
      const seriesCollection = mongodb
        .db("What-Do-I-Read")
        .collection("series");

      const genre = await genresCollection.findOne({ id: genreId });
      setGenreName(genre?.name || "Books");

      const genreBooks = await booksCollection.find({ genreId: genreId });
      setBooks(genreBooks);

      const allSeries = await seriesCollection.find({});
      const seriesMap = {};
      allSeries.forEach((series) => {
        seriesMap[series.id] = series;
      });
      setSeriesData(seriesMap);

      const grouped = {};
      const standalone = [];

      genreBooks.forEach((book) => {
        if (book.seriesName) {
          if (!grouped[book.seriesName]) {
            grouped[book.seriesName] = [];
          }
          grouped[book.seriesName].push(book);
        } else {
          standalone.push(book);
        }
      });

      Object.keys(grouped).forEach((seriesName) => {
        grouped[seriesName].sort(
          (a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0)
        );
      });

      setSeriesBooks(grouped);
      setStandaloneBooks(standalone);
    }

    fetchBooks();
  }, [genreId]);

  return (
    <div className="container-books">
      {/* Page Title */}
      <h2 className="books-page-title">{genreName || "Books"}</h2>
      <hr className="books-page-divider" />

      {/* Standalone Books Section */}
      {standaloneBooks.length > 0 && (
        <div className="books-standalone-section">
          <h3 className="books-standalone-title">Standalone Books</h3>
          <div className="grid grid-5">
            {standaloneBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Series Sections */}
      {Object.keys(seriesBooks).map((seriesName) => (
        <div key={seriesName} className="series-section">
          <h3 className="books-series-title">
            {seriesData[seriesName]?.name || seriesName}
          </h3>
          <div className="grid grid-5 books-series-grid">
            {seriesBooks[seriesName].map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      ))}

      {/* No Books Found */}
      {books.length === 0 && (
        <div className="books-no-books">
          <p>No books found in this genre.</p>
        </div>
      )}
    </div>
  );
}
