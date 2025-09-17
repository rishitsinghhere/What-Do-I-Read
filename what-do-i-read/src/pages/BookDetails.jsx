import { useParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { getAnonymousUser } from "../auth";
import StarRating from "../components/StarRating";
import NotesPopup from "../components/NotesPopup";
import NotesCard from "../components/NotesCard";
import { useAuth } from "../context/AuthContext";
import { getNotesByBook, deleteBookNote } from "../mongo";

export default function BookDetails() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const { saved, setProgress, playlists, addToPlaylist, removeFromPlaylist, toggleSave } =
    useLibrary();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(null);

  const isSaved = !!saved[bookId];
  const progress = saved[bookId]?.progress ?? 0;

  // Fetch book details
  useEffect(() => {
    async function fetchBook() {
      const anon = await getAnonymousUser();
      const mongodb = anon.mongoClient("mongodb-atlas");
      const booksCollection = mongodb.db("What-Do-I-Read").collection("books");
      const findBook = await booksCollection.findOne({ id: bookId });
      setBook(findBook);
    }
    fetchBook();
  }, [bookId]);

  // Fetch notes for this book
  useEffect(() => {
    async function fetchNotes() {
      if (!user?._id) return;
      try {
        const fetchedNotes = await getNotesByBook(bookId, user._id);
        setNotes(fetchedNotes || []);
      } catch (err) {
        console.error("Error loading notes:", err);
        setNotes([]);
      }
    }
    fetchNotes();
  }, [bookId, user]);

  if (!book) return <div>Not found.</div>;

  // Handle saving new or edited note
  const handleNoteSaved = (note) => {
    setNotes((prev) => {
      if (editNote) {
        return prev.map((n) => (n._id === editNote._id ? { ...n, ...note } : n));
      }
      return [...prev, note].sort((a, b) => a.page - b.page);
    });
    setEditNote(null);
  };

  const handleCardClick = (note) => {
    setEditNote(note);
    setIsPopupOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    setIsDeletingNote(noteId);
    try {
      await deleteBookNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
      console.log("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setIsDeletingNote(null);
    }
  };

  return (
    <>
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo3.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

      <div className="container-bookdetails">
        <div className="grid" style={{ gridTemplateColumns: "320px 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 16 }}>
            <img
              src={book.cover}
              alt={book.title}
              style={{ width: "100%", borderRadius: 12 }}
            />
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: "6px 0 6px" }}>{book.title}</h2>
              <button
                className={`btn-icon ${isSaved ? "saved" : "primary"}`}
                onClick={() => toggleSave(book.id)}
              >
                {isSaved ? (
                  <FaBookmark size={22} color="#d4af37" />
                ) : (
                  <FaRegBookmark size={22} color="white" />
                )}
              </button>
            </div>
            <div className="muted">
              {book.authors.join(", ")} • {book.pages} pages • {book.year}
            </div>
            {book.rating && (
              <div style={{ marginTop: "18px" }}>
                <StarRating rating={book.rating} />
              </div>
            )}

            <div className="sep" />
            <div className="label">Notes</div>
            <div className="row">
              <button
                className="btn"
                onClick={() => {
                  setEditNote(null);
                  setIsPopupOpen(true);
                }}
              >
                Add Note
              </button>
            </div>

            <div className="sep" />
            <div className="label">Library</div>
            <div className="row">
              {playlists
                .filter((pl) => pl.name !== "Saved")
                .map((pl) => {
                  const inPl = pl.bookIds.includes(book.id);
                  return (
                    <button
                      key={pl.id}
                      className="btn"
                      onClick={() =>
                        inPl
                          ? removeFromPlaylist(pl.id, book.id)
                          : addToPlaylist(pl.id, book.id)
                      }
                    >
                      {inPl ? `✓ ${pl.name}` : `Add to ${pl.name}`}
                    </button>
                  );
                })}
            </div>

            <div className="sep" />
            <div className="label">About this book</div>
            <p className="muted">{book.summary}</p>
          </div>
        </div>

        {/* Notes grid */}
        {user && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ margin: "10px 0 14px 0" }}>My Notes</h3>
            {notes.length > 0 ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, 200px)",
                  gap: "16px",
                }}
              >
                {notes.map((note) => (
                  <div 
                    key={note._id} 
                    style={{ 
                      opacity: isDeletingNote === note._id ? 0.5 : 1,
                      pointerEvents: isDeletingNote === note._id ? 'none' : 'auto'
                    }}
                  >
                    <NotesCard 
                      note={note} 
                      onClick={handleCardClick}
                      onDelete={handleDeleteNote}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--muted)"
              }}>
                <p>No notes yet for this book.</p>
                <p>Click "Add Note" to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popup */}
      <NotesPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditNote(null);
        }}
        bookId={bookId}
        totalPages={book.pages}
        editNote={editNote}
        onNoteSaved={handleNoteSaved}
      />
    </>
  );
}