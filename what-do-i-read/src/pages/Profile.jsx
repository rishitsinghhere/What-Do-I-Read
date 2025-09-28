import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";
import { getAnonymousUser } from "../auth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { playlists, renamePlaylist, removePlaylist, createPlaylist, saved } =
    useLibrary();

  const [username, setUsername] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [booksById, setBooksById] = useState({});

  useEffect(() => {
    async function fetchBooks() {
      try {
        const anonUser = await getAnonymousUser();
        const mongodb = anonUser.mongoClient("mongodb-atlas");
        const booksCollection = mongodb
          .db("What-Do-I-Read")
          .collection("books");

        const allIds = [
          ...Object.keys(saved),
          ...playlists.flatMap((pl) => pl.bookIds || []),
        ];

        if (allIds.length === 0) return;

        const fetchedBooks = await booksCollection.find({
          id: { $in: allIds },
        });

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
      <h2 className="profile-title">Profile</h2>

      <div className="grid grid-2">
        {/* Profile card */}
        <div className="profile-card profile-card-padding">
          <div>
            {message && (
              <div
                className={`profile-message ${
                  message.includes("Error") ? "error" : "success"
                }`}
              >
                {message}
              </div>
            )}

            <div className="label label-small">Username</div>
            <input
              className="input input-margin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
              pattern="[a-zA-Z0-9]+"
              title="Username can only contain letters and numbers (max 15 characters)"
            />

            <div className="label label-small">Email</div>
            <input className="input input-disabled" value={email} disabled />

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
        <div className="profile-card profile-card-padding">
          <h3 className="genre-name">Saved Books</h3>
          <div className="row row-margin-top">
            <div className="list-h-profile list-h-profile-margin">
              {Object.keys(saved).map((id) => {
                const b = booksById[id];
                return b ? (
                  <div key={id} className="book-wrapper-200">
                    <BookCard book={b} />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Libraries */}
      <div className="row row-library-header">
        <h3 className="genre-name">Libraries</h3>
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

      {playlists
        .filter((pl) => pl.name !== "Saved")
        .map((pl) => (
          <div key={pl.id} className="profile-card profile-card-playlist">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <input
                className="input input-playlist-width"
                value={pl.name}
                onChange={(e) => renamePlaylist(pl.id, e.target.value)}
              />
              <button className="btn" onClick={() => removePlaylist(pl.id)}>
                Delete
              </button>
            </div>
            <div className="list-h list-h-margin-top">
              {pl.bookIds.map((id) => {
                const b = booksById[id];
                return b ? (
                  <div key={id} className="book-wrapper-130">
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
