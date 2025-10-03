// in /src/pages/Profile.jsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  // We will get all necessary book data from the LibraryContext
  const { playlists, renamePlaylist, removePlaylist, createPlaylist, booksById } = useLibrary();

  // Initialize username from the user object in the context
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // No more manual book fetching is needed here! The LibraryContext handles that.

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      // The context function now handles the API call
      await updateProfile({ username: username });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If there's no user, you might want to show a message or redirect
  if (!user) {
    return <div className="container-profile"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div className="container-profile">
      <h2 className="profile-title">Profile</h2>
      <div className="grid grid-2">
        {/* Profile card (no logic changes needed, just uses context data) */}
        <div className="profile-card profile-card-padding">
          <div>
            {message && <div className={`profile-message ${message.includes("Error") ? "error" : "success"}`}>{message}</div>}
            <div className="label label-small">Username</div>
            <input className="input input-margin" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className="label label-small">Email</div>
            <input className="input input-disabled" value={user.email} disabled />
            <div className="row">
              <button className="btn primary" onClick={handleSaveProfile} disabled={isLoading}>
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
              {/* `user.savedBooks` should contain an array of book IDs */}
              {user.savedBooks && user.savedBooks.map((id) => {
                const b = booksById[id];
                return b ? <div key={id} className="book-wrapper-200"><BookCard book={b} /></div> : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Libraries (no logic changes needed) */}
      <div className="row row-library-header">
        <h3 className="genre-name">Libraries</h3>
        <button className="btn" onClick={() => { const name = prompt("Playlist name"); if (name) createPlaylist(name); }}>
          New Library
        </button>
      </div>
      {playlists.filter((pl) => pl.name !== "Saved").map((pl) => (
        <div key={pl.id} className="profile-card profile-card-playlist">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <input className="input input-playlist-width" value={pl.name} onChange={(e) => renamePlaylist(pl.id, e.target.value)} />
            <button className="btn" onClick={() => removePlaylist(pl.id)}>Delete</button>
          </div>
          <div className="list-h list-h-margin-top">
            {pl.bookIds.map((id) => {
              const b = booksById[id];
              return b ? <div key={id} className="book-wrapper-130"><BookCard book={b} /></div> : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}