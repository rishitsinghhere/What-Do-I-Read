import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { useEffect, useState } from "react";
import { getGenrePageData } from "../services/api";

// BOOKS PAGE - Displays books by genre, organized by series and standalone books

export default function Books() {
  const { genreId } = useParams();
  
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const data = await getGenrePageData(genreId);
        setPageData(data);
      } catch (error) {
        console.error("Error fetching page data:", error);
        setPageData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [genreId]);

  if (isLoading) {
    return <div className="container-books"><p>Loading...</p></div>;
  }

  if (!pageData || (pageData.standaloneBooks.length === 0 && Object.keys(pageData.seriesBooks).length === 0)) {
    return (
      <div className="container-books">
        <h2 className="books-page-title">{pageData?.genreName || "Books"}</h2>
        <hr className="books-page-divider" />
        <div className="books-no-books">
          <p>No books found in this genre.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-books">
      <h2 className="books-page-title">{pageData.genreName}</h2>
      <hr className="books-page-divider" />

      {/* Standalone Books Section */}
      {pageData.standaloneBooks.length > 0 && (
        <div className="books-standalone-section">
          <h3 className="books-standalone-title">Standalone Books</h3>
          <div className="grid grid-5">
            {pageData.standaloneBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Series Sections */}
      {Object.keys(pageData.seriesBooks).map((seriesId) => {
        const series = pageData.seriesBooks[seriesId];
        return (
          <div key={seriesId} className="series-section">
            <h3 className="books-series-title">{series.name}</h3>
            <div className="grid grid-5 books-series-grid">
              {series.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}