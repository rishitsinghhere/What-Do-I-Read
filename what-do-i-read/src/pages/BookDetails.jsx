import { useParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import * as Realm from "realm-web";
import { useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { getAnonymousUser } from "../auth";


export default function BookDetails(){
  const { bookId } = useParams();
  const { saved, setProgress, playlists, addToPlaylist, removeFromPlaylist, toggleSave } = useLibrary();
  const [book, setBook] = useState(null);
  const isSaved = !!saved[bookId];
  const progress = saved[bookId]?.progress ?? 0;

  useEffect(() => {
    async function fetchBook() {
      const user = await getAnonymousUser();

      const mongodb = user.mongoClient("mongodb-atlas");
      const booksCollection = mongodb.db("What-Do-I-Read").collection("books");

      const findBook = await booksCollection.findOne({
        id: bookId
      });

      setBook(findBook);

    }

    fetchBook();
  }, [bookId]);

  if (!book) return <div>Not found.</div>;

  const percent = Math.round(progress);

  return (
<div class = "container-bookdetails">
    <div className="grid" style={{gridTemplateColumns:"320px 1fr", gap:20}}>
      <div className="card" style={{padding:16}}>
        <img src={book.cover} alt={book.title} style={{width:"100%",borderRadius:12}} />
      </div>
      <div className="card" style={{padding:18}}>
        <div className="row" style={{justifyContent:"space-between"}}>
          <h2 style={{margin:"6px 0 6px"}}>{book.title}</h2>
        <button 
            className={`btn-icon ${isSaved ? "saved" : "primary"}`} 
            onClick={() => toggleSave(book.id)}
          >
            {isSaved ? <FaBookmark size={22}  color="#d4af37"/> : <FaRegBookmark size={22} color="white"/>}
        </button>

        </div>
        <div className="muted">{book.authors.join(", ")} • {book.pages} pages • {book.year}</div>
        {book.series && (
          <div className="row" style={{marginTop:10}}>
            <span className="pill">Series: {book.series.name}</span>
            <span className="pill">Vol. {book.series.volume}</span>
          </div>
        )}
        <div className="sep" />
        <div className="label">Reading Progress</div>
        <input type="range" min="0" max={book.pages} value={progress}
          onChange={(e)=>setProgress(book.id, Number(e.target.value))}
          style={{width:"100%"}}
        />
        <div className="row"><div className="pill">{percent} pages read</div></div>

        <div className="sep" />
        <div className="label">Playlists</div>
        <div className="row">
          {playlists.map(pl=>{
            const inPl = pl.bookIds.includes(book.id);
            return (
              <button key={pl.id} className="btn"
                onClick={()=> inPl ? removeFromPlaylist(pl.id, book.id) : addToPlaylist(pl.id, book.id)}>
                {inPl ? `✓ ${pl.name}` : `Add to ${pl.name}`}
              </button>
            )
          })}
        </div>

        <div className="sep" />
        <div className="label">About this book</div>
        <p className="muted">
          {book.summary}
        </p>
      </div>
    </div>
</div>
  )
}
