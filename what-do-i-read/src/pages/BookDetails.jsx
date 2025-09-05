import { useParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { booksById } from "../data/books";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";


export default function BookDetails(){
  const { bookId } = useParams();
  const book = booksById[bookId];
  const { saved, setProgress, playlists, addToPlaylist, removeFromPlaylist, toggleSave } = useLibrary();
  const isSaved = !!saved[bookId];
  const progress = saved[bookId]?.progress ?? 0;

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
        <input type="range" min="0" max="100" value={progress}
          onChange={(e)=>setProgress(book.id, Number(e.target.value))}
          style={{width:"100%"}}
        />
        <div className="row"><div className="pill">{percent}% read</div></div>

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
          Curated metadata for demo. Replace with API data later. Explore reviews, related works, and upcoming releases by the author in your backend phase.
        </p>
      </div>
    </div>
</div>
  )
}
