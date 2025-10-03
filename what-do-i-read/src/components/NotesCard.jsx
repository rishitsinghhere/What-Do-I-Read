import { FaTrash } from "react-icons/fa";

// NOTE CARD COMPONENT - Individual note display with delete and date formatting

export default function NoteCard({ note, onClick, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id); // Correctly uses the custom ID field
    }
  };

  return (
    <div 
      className="card note-card"
      onClick={() => onClick(note)}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="note-delete-btn"
        title="Delete Note"
      >
        <FaTrash size={10} color="white" />
      </button>

      <div>
        {/* Note Header */}
        <div className="row note-header">
          <div className="pill note-page-pill">
            Page {note.page}
          </div>
          <small className="note-date">
            {formatDate(note.createdAt)}
          </small>
        </div>
        
        {/* Note Description */}
        <p className="note-description">
          {note.description}
        </p>
      </div>
      
      {/* Edited Date */}
      {note.updatedAt && note.updatedAt !== note.createdAt && (
        <small className="note-edited">
          Edited {formatDate(note.updatedAt)}
        </small>
      )}
    </div>
  );
}