import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { useEffect, useState } from "react";
import { getAnonymousUser } from "../auth";

export default function Books(){
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
      const genresCollection = mongodb.db("What-Do-I-Read").collection("genres");
      const seriesCollection = mongodb.db("What-Do-I-Read").collection("series");

      const genre = await genresCollection.findOne({ id: genreId });
      setGenreName(genre?.name || "Books");

      const genreBooks = await booksCollection.find({ genreId: genreId });
      setBooks(genreBooks);

      // Fetch all series data
      const allSeries = await seriesCollection.find({});
      const seriesMap = {};
      allSeries.forEach(series => {
        seriesMap[series.id] = series;
      });
      setSeriesData(seriesMap);

      // Group books by series
      const grouped = {};
      const standalone = [];

      genreBooks.forEach(book => {
        if (book.seriesName) {
          if (!grouped[book.seriesName]) {
            grouped[book.seriesName] = [];
          }
          grouped[book.seriesName].push(book);
        } else {
          standalone.push(book);
        }
      });

      // Sort books within each series by seriesOrder
      Object.keys(grouped).forEach(seriesName => {
        grouped[seriesName].sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
      });

      setSeriesBooks(grouped);
      setStandaloneBooks(standalone);
    }

    fetchBooks();
  }, [genreId]);

  return (
    <>

    
      <div className="container-books">
        <h2 style={{margin:"10px 0 14px"}}>{genreName || "Books"}</h2>
        <hr></hr>
        {/* Standalone Books Section */}
        {standaloneBooks.length > 0 && (
          <div className="standalone-books-section">
            <h3 style={{margin:"20px 10px"}}>Standalone Books</h3>
            <div className="grid grid-5">
              {standaloneBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* Series Sections */}
        
        {Object.keys(seriesBooks).map(seriesName => (
          <div key={seriesName} className="series-section">
            <h3 style={{margin:"20px 0 14px"}}>
              {seriesData[seriesName]?.name || seriesName}
            </h3>
            <div className="grid grid-5" style={{gridTemplateColumns: "repeat(5, 1fr)", gap: "30px"}}>
              {seriesBooks[seriesName].map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ))}

        {/* If no books found */}
        {books.length === 0 && (
          <div className="no-books">
            <p>No books found in this genre.</p>
          </div>
        )}
      </div>
    </>
  )
}