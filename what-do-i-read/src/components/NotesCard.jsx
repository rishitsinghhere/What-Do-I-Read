import { FaTrash } from "react-icons/fa";

export default function NoteCard({ note, onClick, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note._id);
    }
  };

  return (
    <div 
      className="card"
      onClick={() => onClick(note)}
      style={{
        padding: "12px",
        cursor: "pointer",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        border: "1px solid var(--border, #e1e5e9)",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "var(--danger, #dc3545)",
          border: "none",
          borderRadius: "4px",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: 0.8,
          transition: "opacity 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.8";
        }}
        title="Delete Note"
      >
        <FaTrash size={10} color="white" />
      </button>

      <div>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "8px", marginRight: "30px" }}>
          <div 
            className="pill" 
            style={{ 
              backgroundColor: "var(--primary, #007bff)", 
              color: "white",
              fontSize: "12px",
              padding: "2px 8px"
            }}
          >
            Page {note.page}
          </div>
          <small style={{ color: "var(--muted)", fontSize: "11px" }}>
            {formatDate(note.createdAt)}
          </small>
        </div>
        
        <p style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: "1.4",
          color: "var(--text)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {note.description}
        </p>
      </div>
      
      {note.updatedAt && note.updatedAt !== note.createdAt && (
        <small style={{ 
          color: "var(--muted)", 
          fontSize: "10px", 
          marginTop: "4px",
          alignSelf: "flex-end"
        }}>
          Edited {formatDate(note.updatedAt)}
        </small>
      )}
    </div>
  );
}