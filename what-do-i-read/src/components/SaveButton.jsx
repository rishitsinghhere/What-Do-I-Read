import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaBookmark, FaRegBookmark } from "react-icons/fa"; // solid + outline icons

export default function SaveButton({ bookId, isSaved }) {
  const { toggleSave } = useLibrary();
  const { user } = useAuth(); // Get the user from the AuthContext
  const navigate = useNavigate(); // Get the navigate function for redirection

  const handleSaveClick = () => {
    if (user) {
      // If user is logged in, proceed with saving the book
      toggleSave(bookId);
    } else {
      // If user is not logged in, redirect to the login/signup page
      alert("Please log in to save books to your library.");
      navigate("/auth");
    }
  };

  return (
    <button
      className="btn-icon"
      onClick={handleSaveClick} // Use the new conditional handler
      title={isSaved ? "Remove from Saved" : "Save"}
    >
      {isSaved ? (
        <FaBookmark size={20} color="#d4af37" /> // filled gold bookmark
      ) : (
        <FaRegBookmark size={20} color="white" /> // outlined white bookmark
      )}
    </button>
  );
}