import { useState, useEffect } from "react";
import GenreCard from "../components/GenreCard";
import BookCard from "../components/BookCard";
import * as Realm from "realm-web";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});

  useEffect(() => {
    async function fetchData() {
      const app = new Realm.App({ id: "what-do-i-read-uxbmken" });
      const mongo =
        app.currentUser?.mongoClient("mongodb-atlas") ||
        (await app.logIn(Realm.Credentials.anonymous())).mongoClient(
          "mongodb-atlas"
        );

      const genresCollection = mongo.db("What-Do-I-Read").collection("genres");
      const booksCollection = mongo.db("What-Do-I-Read").collection("books");

      const genresData = await genresCollection.find({});
      const booksData = await booksCollection.find({});

      const grouped = {};
      genresData.forEach((genre) => {
        grouped[genre.id] = booksData.filter(
          (book) => book.genreId === genre.id
        );
      });

      setGenres(genresData);
      setBooksByGenre(grouped);
    }

    fetchData();
  }, []);

  return (
    <div className="container-genres">
      <h1 className="genres-title">Genres</h1>

      <div className="grid grid-4 genres-grid">
        {genres.map((genre) => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </div>

      {genres.map((genre, index) => (
        <section key={genre.id} className="genre-section">
          <div className="row genre-row">
            <h3 className="genre-name">{genre.name}</h3>
            <a className="btn ghost" href={`/books/${genre.id}`}>
              View all
            </a>
          </div>

          <div className="grid grid-5 books-grid">
            {(booksByGenre[genre.id] || []).slice(0, 5).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {index < genres.length - 1 && <hr className="genre-divider" />}
        </section>
      ))}
    </div>
  );
}
