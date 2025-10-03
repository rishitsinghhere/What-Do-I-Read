import { useParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import StarRating from "../components/StarRating";
import NotesPopup from "../components/NotesPopup";
import NotesCard from "../components/NotesCard";
import { useAuth } from "../context/AuthContext";
// --- CHANGE #1: Import from your API service, not mongo/auth ---
import { getBookById, getNotesForBook, deleteNote } from "../services/api";

// BOOK DETAILS PAGE - Individual book information with notes and library management

export default function BookDetails() {
  const { bookId } = useParams();
  const { user, token } = useAuth(); // Get the token for API calls
  const { saved, playlists, addToPlaylist, removeFromPlaylist, toggleSave } =
    useLibrary();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added for better UX

  const isSaved = !!saved[bookId];

  // --- CHANGE #2: Consolidate all data fetching into one useEffect ---
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // 1. Fetch the book details from your API
        const bookData = await getBookById(bookId);
        setBook(bookData);

        // 2. If the user is logged in, fetch their notes for this book
        if (user && token && bookData) {
          const notesData = await getNotesForBook(bookId, token);
          setNotes(notesData || []);
        }
      } catch (err) {
        console.error("Error loading page data:", err);
        setBook(null); // Set book to null on error to show "Not found"
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [bookId, user, token]); // Rerun when the book or user changes

  // --- CHANGE #3: Update handlers to use custom `id` ---
  const handleNoteSaved = (note) => {
    setNotes((prev) => {
      if (editNote) {
        return prev.map((n) => (n.id === editNote.id ? { ...n, ...note } : n));
      }
      return [...prev, note].sort((a, b) => a.page - b.page);
    });
    setEditNote(null);
  };

  const handleCardClick = (note) => {
    setEditNote(note);
    setIsPopupOpen(true);
  };

  // --- CHANGE #4: Update delete handler to call the API ---
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId, token);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.message || "Failed to delete note. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!book) {
    return <div>Book not found.</div>;
  }

  return (
    <>
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo3.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

      <div className="container-bookdetails">
        <div className="grid book-details-main-grid">
          {/* Book Cover */}
          <div className="card book-details-cover-card">
            <img src={book.cover} alt={book.title} className="book-details-cover-image" />
          </div>

          {/* Book Information */}
          <div className="card book-details-info-card">
            <div className="row book-details-header">
              <h2 className="book-details-title">{book.title}</h2>
              <button
                className={`btn-icon ${isSaved ? "saved" : "primary"}`}
                onClick={() => toggleSave(book.id)}
              >
                {isSaved ? <FaBookmark size={22} color="#d4af37" /> : <FaRegBookmark size={22} color="white" />}
              </button>
            </div>

            <div className="muted">{book.authors.join(", ")} • {book.pages} pages • {book.year}</div>

            {book.rating && <div className="book-details-rating"><StarRating rating={book.rating} /></div>}

            <div className="book-details-separator" />
            <div className="label">Notes</div>
            <div className="row">
              <button className="btn" onClick={() => { setEditNote(null); setIsPopupOpen(true); }}>
                Add Note
              </button>
            </div>

            <div className="book-details-separator" />
            <div className="label">Library</div>
            <div className="row">
              {playlists.filter((pl) => pl.name !== "Saved").map((pl) => {
                const inPl = pl.bookIds.includes(book.id);
                return (
                  <button key={pl.id} className="btn" onClick={() => inPl ? removeFromPlaylist(pl.id, book.id) : addToPlaylist(pl.id, book.id)}>
                    {inPl ? `✓ ${pl.name}` : `Add to ${pl.name}`}
                  </button>
                );
              })}
            </div>

            <div className="book-details-separator" />
            <div className="label">About this book</div>
            <p className="muted">{book.summary}</p>
          </div>
        </div>

        {/* Notes Section */}
        {user && (
          <div className="book-details-notes-section">
            <h3 className="book-details-notes-title">My Notes</h3>
            {notes.length > 0 ? (
              <div className="grid book-details-notes-grid">
                {notes.map((note) => (
                  <div key={note.id} className="book-details-note-wrapper">
                    <NotesCard note={note} onClick={handleCardClick} onDelete={handleDeleteNote} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="book-details-no-notes">
                <p>No notes yet for this book.</p>
                <p>Click "Add Note" to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes Popup */}
      <NotesPopup
        isOpen={isPopupOpen}
        onClose={() => { setIsPopupOpen(false); setEditNote(null); }}
        bookId={bookId}
        totalPages={book.pages}
        editNote={editNote}
        onNoteSaved={handleNoteSaved}
      />
    </>
  );
}