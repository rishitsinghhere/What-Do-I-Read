import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createBookNote, updateBookNote } from "../mongo";

export default function NotesPopup({ 
  isOpen, 
  onClose, 
  bookId, 
  totalPages, 
  editNote = null, 
  onNoteSaved 
}) {
  const { user } = useAuth();
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
        <h3>{editNote ? "Edit Note" : "Add Note"}</h3>

        {error && <div className="notes-error">{error}</div>}

        <div className="form-row">
          <div className="label">Page Number</div>
          <input
            className="input"
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder={`Enter page (1-${totalPages})`}
          />
          <small style={{ color: "var(--muted)", fontSize: "12px" }}>
            Book has {totalPages} pages
          </small>
        </div>

        <div className="form-row">
          <div className="label">Description</div>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your note..."
            rows="4"
            style={{ resize: "vertical", minHeight: "80px" }}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn primary"
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
