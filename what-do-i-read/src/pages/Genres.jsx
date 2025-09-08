import { useState, useEffect } from "react";
import GenreCard from "../components/GenreCard";
import BookCard from "../components/BookCard";
import { getAnonymousUser } from "../auth";
import * as Realm from "realm-web";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});

  useEffect(() => {
    async function fetchData() {
      const app = new Realm.App({ id: "what-do-i-read-uxbmken" });
      const mongo = app.currentUser?.mongoClient("mongodb-atlas") 
      || (await app.logIn(Realm.Credentials.anonymous())).mongoClient("mongodb-atlas");

      const genresCollection = mongo.db("What-Do-I-Read").collection("genres");
      const booksCollection = mongo.db("What-Do-I-Read").collection("books");

      const genresData = await genresCollection.find({});
      const booksData = await booksCollection.find({});

      const grouped = {};
      genresData.forEach((genre) => {
        grouped[genre.id] = booksData.filter((book) => book.genreId === genre.id);
      });

      setGenres(genresData);
      setBooksByGenre(grouped);
    }

    fetchData();
  }, []);

  return (
    <>
      <div class="container-genres">

      <h2 style={{ margin: "10px 0 14px" }}>Genres</h2>

      {/* Genres grid */}
      <div className="grid grid-4" style={{ marginBottom: 30 }}>
        {genres.map((genre) => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </div>

      {/* Books by genre */}
      {genres.map((genre, index) => (
        <section
          key={genre.id}
          style={{
            padding: "60px 0",
          }}
        >
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <h3 style={{ marginBottom: 15 }}>{genre.name}</h3>
            <a className="btn ghost" href={`/books/${genre.id}`}>
              View all
            </a>
          </div>

          <div className="grid grid-5" style={{ marginTop: 16 }}>
            {(booksByGenre[genre.id] || []).slice(0, 5).map((book) => (
              <BookCard key={book.id} book={book} />
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
