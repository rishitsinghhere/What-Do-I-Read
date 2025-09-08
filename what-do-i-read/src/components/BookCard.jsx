import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import SaveButton from "./SaveButton";

export default function BookCard({ book }) {
  const { saved } = useLibrary();
  const isSaved = !!saved[book.id];

  return (
    <div className="card-book" style={{ width: "200px" }}>
      <Link to={`/book/${book.id}`}>
        <div
          style={{
            width: "100%",
            height: "250px",         // container height
            display: "flex",
            justifyContent: "center",
            alignItems: "center",      // background filler if aspect ratio differs
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",  // ✅ shows full image
              borderRadius: "6px",
            }}
          />
        </div>
      </Link>

      {/* Title + Save Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "8px",
          gap: "8px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "15px",
            flex: 1,
            lineHeight: "1.3",
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "unset",
          }}
        >
          {book.title}
        </h4>
        <SaveButton bookId={book.id} isSaved={isSaved} />
      </div>
    </div>
  );
}
