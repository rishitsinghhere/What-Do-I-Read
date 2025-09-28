import { Link } from "react-router-dom";
import * as Realm from "realm-web";
import { useState, useEffect } from "react";
import { getAnonymousUser } from "../auth";

export default function GenreCard({ genre }) {
  const [bg, setBg] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchGenreData() {
      const user = await getAnonymousUser();

      const mongodb = user.mongoClient("mongodb-atlas");
      const booksCollection = mongodb.db("What-Do-I-Read").collection("books");

      const sampleBook = await booksCollection.findOne({ genreId: genre.id });
      if (sampleBook) setBg(sampleBook.cover);

      const total = await booksCollection.count({ genreId: genre.id });
      setCount(total);
    }

    fetchGenreData();
  }, [genre.id]);

  return (
    <Link
      to={`/books/${genre.id}`}
      className="genre-card"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,10,14,.15), rgba(8,10,14,.85)), url(${bg})`,
      }}
    >
      {/* Genre Name */}
      <div className="genre-pill">{genre.name}</div>

      {/* Book Count */}
      <div className="genre-count">{count} books</div>
    </Link>
  );
}
