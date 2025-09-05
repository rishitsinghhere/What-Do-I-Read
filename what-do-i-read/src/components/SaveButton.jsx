import { useLibrary } from "../context/LibraryContext";
import { FaBookmark, FaRegBookmark } from "react-icons/fa"; // solid + outline icons

export default function SaveButton({ bookId, isSaved }) {
  const { toggleSave } = useLibrary();

  return (
    <button
      className="btn-icon"
      onClick={() => toggleSave(bookId)}
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
