import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";
import { getAnonymousUser } from "../auth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const {
    playlists,
    renamePlaylist,
    removePlaylist,
    createPlaylist,
    saved,
  } = useLibrary();

  const [username, setUsername] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // bookId -> book object (title, cover, etc.)
  const [booksById, setBooksById] = useState({});

  // Fetch full book data for saved + playlists
  useEffect(() => {
    async function fetchBooks() {
      try {
        const anonUser = await getAnonymousUser();
        const mongodb = anonUser.mongoClient("mongodb-atlas");
        const booksCollection = mongodb.db("What-Do-I-Read").collection("books");

        // Collect all IDs: saved + playlists
        const allIds = [
          ...Object.keys(saved),
          ...playlists.flatMap((pl) => pl.bookIds || []),
        ];

        if (allIds.length === 0) return;

        // Fetch all matching books
        const fetchedBooks = await booksCollection.find({
          id: { $in: allIds },
        });

        // Convert to map { id: book }
        const map = {};
        fetchedBooks.forEach((b) => {
          map[b.id] = b;
        });

        setBooksById(map);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    }

    fetchBooks();
  }, [saved, playlists]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      await updateProfile({ name: username });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-profile">
      <h2 style={{ margin: "10px 0 14px 10px" }}>Profile</h2>
      <div className="grid grid-2">
        {/* Profile card */}
        <div className="card" style={{ padding: 16 }}>
          <div>
            {message && (
              <div
                style={{
                  color: message.includes("Error")
                    ? "var(--danger, #dc3545)"
                    : "var(--success, #28a745)",
                  backgroundColor: message.includes("Error")
                    ? "var(--danger-light, #f8d7da)"
                    : "var(--success-light, #d4edda)",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}

            <div className="label" style={{ marginBottom: 4 }}>
              Username
            </div>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
              pattern="[a-zA-Z0-9]+"
              title="Username can only contain letters and numbers (max 15 characters)"
              style={{ marginBottom: 12 }}
            />

            <div className="label" style={{ marginBottom: 4 }}>
              Email
            </div>
            <input
              className="input"
              value={email}
              disabled
              style={{
                cursor: "not-allowed",
                opacity: 0.7,
                marginBottom: 12,
              }}
            />

            <div className="row">
              <button
                className="btn primary"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Saved Books */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ margin: 0 }}>Saved Books</h3>
          <div className="row" style={{ marginTop: 12 }}>
            <div className="list-h-profile" style={{ marginTop: 10}}>
              {Object.keys(saved).map((id) => {
                const b = booksById[id];
                return b ? (
                  <div key={id}  style={{ width: 200, flexShrink: 0 }}>
                    <BookCard book={b} />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Playlists */}
      <div className="card" />
      <div
        className="row"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 35,
          width: "100%",
        }}
      >
        <h3 style={{ margin: 0 }}>Libraries</h3>
        <button
          className="btn"
          onClick={() => {
            const playlistName = prompt("Playlist name");
            if (playlistName) createPlaylist(playlistName);
          }}
        >
          New Library
        </button>
      </div>

      {playlists.map((pl) => (
        <div
          key={pl.id}
          className="card"
          style={{ padding: 14, marginTop: 12 }}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            <input
              className="input"
              value={pl.name}
              onChange={(e) => renamePlaylist(pl.id, e.target.value)}
              style={{ width: "90%" }}
            />
            {pl.id !== "default" && (
              <button className="btn" onClick={() => removePlaylist(pl.id)}>
                Delete
              </button>
            )}
          </div>
          <div className="list-h" style={{ marginTop: 20 }}>
            {pl.bookIds.map((id) => {
              const b = booksById[id];
              return b ? (
                <div key={id} style={{ width: 130 }}>
                  <BookCard book={b} />
                </div>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
