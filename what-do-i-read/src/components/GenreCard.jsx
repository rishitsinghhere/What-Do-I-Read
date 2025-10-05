import { Link } from "react-router-dom";

export default function GenreCard({ genre }) {

  return (
    <Link
      to={`/books/${genre.id}`}
      className="genre-card"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,10,14,.15), rgba(8,10,14,.85)), url(${genre.sampleCover})`,
      }}
    >
      {/* Genre Name */}
      <div className="genre-pill">{genre.name}</div>

      {/* Book Count */}
      <div className="genre-count">{genre.bookCount} books</div>
    </Link>
  );
}