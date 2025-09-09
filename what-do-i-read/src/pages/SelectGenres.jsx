import { useMemo, useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import * as Realm from "realm-web";
import { getAnonymousUser } from "../auth";

export default function SelectGenres(){
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  useEffect(() => {
    async function fetchData() {
      const user = await getAnonymousUser();

      const mongodb = user.mongoClient("mongodb-atlas");
      const db = mongodb.db("What-Do-I-Read");
      const booksCollection = db.collection("books");
      const genresCollection = db.collection("genres");

      const [fetchedGenres, fetchedBooks] = await Promise.all([
        genresCollection.find({}),
        booksCollection.find({}),
      ]);

      setGenres(fetchedGenres);
      setBooks(fetchedBooks);
    }
    fetchData();
  }, []);

  const results = useMemo(() => {
    if (!selected.length) return books.slice(0, 12);
    return books.filter((b) => selected.includes(b.genreId));
  }, [selected, books]);

  return (
    <>
    <div class ="container-selectgenres">
      <h2 style={{margin:"10px 0 8px"}}>Select Genres</h2>
      <p className="muted" style={{marginTop:0}}>Pick one or many</p>

    <hr style={{ marginTop: 40,  borderColor: "transparent"}} />



      <div className="row" style={{marginBottom:14}}>
        {genres.map(g=>(
          <button key={g.id}
            onClick={()=>toggle(g.id)}
            className={`btn ${selected.includes(g.id)?"primary":""}`}>
            {g.name}
          </button>
        ))}
        <button className="btn-clear" onClick={()=>setSelected([])}>Clear</button>
      </div>

       <hr style={{ marginTop: 50, marginBottom: 50 , borderColor: "#333", borderWidth: "2px" }} />

      <div className="grid grid-5">
        {results.map(b=><BookCard key={b.id} book={b} />)}
      </div>
    </div>
    </>

  )
}
