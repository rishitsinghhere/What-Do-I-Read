import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { createBookNote, updateBookNote } from "../mongo";

// NOTES POPUP COMPONENT - Modal for creating and editing book notes

export default function NotesPopup({ 
  isOpen, 
  onClose, 
  bookId, 
  totalPages, 
  editNote = null, 
  onNoteSaved 
}) {
  const { user } = useAuth();
  const { saved, toggleSave } = useLibrary();
  const [page, setPage] = useState(editNote?.page || "");
  const [description, setDescription] = useState(editNote?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editNote) {
      setPage(editNote.page.toString());
      setDescription(editNote.description);
    } else {
      setPage("");
      setDescription("");
    }
    setError("");
  }, [editNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");
    const pageNumber = Number(page);

    if (!page || !description.trim()) {
      setError("Please fill in both page number and description.");
      return;
    }
    if (isNaN(pageNumber) || pageNumber < 1) {
      setError("Please enter a valid page number (minimum 1).");
      return;
    }
    if (pageNumber > totalPages) {
      alert(`Page number cannot be greater than total pages (${totalPages})`);
      return;
    }
    if (!user?._id) {
      setError("Please log in to save notes.");
      return;
    }

    setIsLoading(true);
    try {
      let savedNote;
      
      if (editNote) {
        savedNote = await updateBookNote(editNote._id, {
          page: pageNumber,
          description: description.trim(),
          updatedAt: new Date()
        });
      } else {
        savedNote = await createBookNote({
          bookId,
          userId: user._id,
          page: pageNumber,
          description: description.trim(),
          createdAt: new Date()
        });

        const isBookSaved = !!saved[bookId];
        if (!isBookSaved) {
          try {
            await toggleSave(bookId);
            console.log("Book automatically saved when creating note");
          } catch (error) {
            console.error("Error auto-saving book:", error);
          }
        }
      }
      
      onNoteSaved(savedNote);
      onClose();
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="notes-modal" onClick={onClose}>
      <div className="notes-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <h3>{editNote ? "Edit Note" : "Add Note"}</h3>

        {/* Error Message */}
        {error && <div className="notes-error">{error}</div>}

        {/* Page Number Input */}
        <div className="form-row">
          <div className="label notes-form-label">Page Number</div>
          <input
            className="input"
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder={`Enter page (1-${totalPages})`}
          />
          <small className="notes-page-info">
            Book has {totalPages} pages
          </small>
        </div>

        {/* Description Input */}
        <div className="form-row">
          <div className="label notes-form-label">Description</div>
          <textarea
            className="input notes-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your note..."
            rows="4"
          />
        </div>

        {/* Action Buttons */}
        <div className="row notes-buttons">
          <button className="btn notes-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn primary notes-btn"
            onClick={handleSave}
            disabled={isLoading || !page || !description.trim()}
          >
            {isLoading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}