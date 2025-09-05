import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import SaveButton from "./SaveButton";

export default function BookCard({ book }) {
  const { saved } = useLibrary();
  const isSaved = !!saved[book.id];

  return (
    <div className="card-book" style={{ width: "200px" }}>
      <Link to={`/book/${book.id}`}>
        <img
          src={book.cover}
          alt={book.title}
          loading="lazy"
          style={{
            maxwidth: "100px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      </Link>

      {/* Title + Save Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "left",
          marginTop: "8px",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "15px", flex: 1 }}>{book.title}</h4>
        <SaveButton bookId={book.id} isSaved={isSaved} />
      </div>

      {/* Author full width */}
      <div className="meta" style={{ marginTop: "4px" }}>
        {book.authors.join(", ")}
      </div>
    </div>
  );
}
