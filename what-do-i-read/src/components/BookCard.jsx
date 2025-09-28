import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import SaveButton from "./SaveButton";

export default function BookCard({ book }) {
  const { saved } = useLibrary();
  const isSaved = !!saved[book.id];

  return (
    <div className="card-book">
      {/* Cover Image */}
      <Link to={`/book/${book.id}`}>
        <div className="book-image-container">
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="book-image"
          />
        </div>
      </Link>

      {/* Title + Save Button */}
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <SaveButton bookId={book.id} isSaved={isSaved} />
      </div>
    </div>
  );
}
