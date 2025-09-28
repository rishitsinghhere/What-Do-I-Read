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

// BOOK DETAILS PAGE - Individual book information with notes and library management

export default function BookDetails() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const { saved, playlists, addToPlaylist, removeFromPlaylist, toggleSave } =
    useLibrary();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(null);

  const isSaved = !!saved[bookId];

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
        return prev.map((n) =>
          n._id === editNote._id ? { ...n, ...note } : n
        );
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
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
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
            <img
              src={book.cover}
              alt={book.title}
              className="book-details-cover-image"
            />
          </div>

          {/* Book Information */}
          <div className="card book-details-info-card">
            <div className="row book-details-header">
              <h2 className="book-details-title">{book.title}</h2>
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
              <div className="book-details-rating">
                <StarRating rating={book.rating} />
              </div>
            )}

            <div className="book-details-separator" />
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

            <div className="book-details-separator" />
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
                  <div
                    key={note._id}
                    className={`book-details-note-wrapper ${
                      isDeletingNote === note._id ? "deleting" : ""
                    }`}
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
