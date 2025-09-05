import { genres, booksByGenre } from "../data/books";
import GenreCard from "../components/GenreCard";
import BookCard from "../components/BookCard";

export default function Genres() {
  return (
    <>
<div class="container-genres">

      <h2 style={{ margin: "10px 0 14px" }}>Genres</h2>

      {/* Genres grid */}
      <div className="grid grid-4" style={{ marginBottom: 30 }}>
        {genres.map((g) => (
          <GenreCard key={g.id} genre={g} />
        ))}
      </div>

      {/* Books by genre */}
      {genres.map((g, index) => (
        <section
          key={g.id}
          style={{
            padding: "60px 0", // space before + after
          }}
        >
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <h3 style={{ marginBottom: 15 }}>{g.name}</h3>
            <a className="btn ghost" href={`/books/${g.id}`}>
              View all
            </a>
          </div>

          <div className="grid grid-5" style={{ marginTop: 16 }}>
            {booksByGenre[g.id].slice(0, 5).map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>

          {/* Horizontal line after each section except last */}
          {index < genres.length - 1 && (
            <hr style={{ marginTop: 50, borderColor: "#333", borderWidth: "2px" }} />
          )}
        </section>
      ))}
      </div>
    </>
  );
}
