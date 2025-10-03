import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { createNote, updateNote } from "../services/api";

export default function NotesPopup({
  isOpen,
  onClose,
  bookId,
  totalPages,
  editNote = null,
  onNoteSaved,
}) {
  const { user, token } = useAuth(); // Assuming your AuthContext provides the token
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
    const pageNumber = Number(page); // --- Validation Logic (remains the same) ---

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
    if (!user?.id) {
      setError("Please log in to save notes.");
      return;
    }

    setIsLoading(true);
    try {
      let savedNote; // --- API Call Logic (Logic Changes Only) ---

      if (editNote) {
        // UPDATE NOTE
        savedNote = await updateNote(
          editNote.id,
          {
            page: pageNumber,
            description: description.trim(),
          },
          token
        );
      } else {
        // CREATE NEW NOTE
        savedNote = await createNote(
          {
            bookId,
            // FIX: RESTORE sending userId for the note document creation
            userId: user.id,
            id: new Date().getTime().toString(), // Generate custom ID on client
            page: pageNumber, // Ensure page is sent as a number
            description: description.trim(),
          },
          token
        ); // Auto-save logic (no change)

        const isBookSaved = !!saved[bookId];
        if (!isBookSaved) {
          try {
            await toggleSave(bookId);
          } catch (error) {
            console.error("Error auto-saving book:", error);
          }
        }
      }

      onNoteSaved(savedNote);
      onClose();
    } catch (err) {
      console.error("Error saving note:", err);
      setError(err.message || "Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- No changes are needed to your JSX below this line ---
  return (
    <div className="notes-modal" onClick={onClose}>
      <div className="notes-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{editNote ? "Edit Note" : "Add Note"}</h3>
        {error && <div className="notes-error">{error}</div>}
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
          <small className="notes-page-info">Book has {totalPages} pages</small>
        </div>
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
        <div className="row notes-buttons">
          <button
            className="btn notes-btn"
            onClick={onClose}
            disabled={isLoading}
          >
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