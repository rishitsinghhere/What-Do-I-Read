import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

import {
  getAllBooks,
  addSavedBook,
  removeSavedBook,
  updateUserPlaylists,
} from "../services/api";

const LibraryCtx = createContext(null);

export function LibraryProvider({ children }) {
  // Access user, token, and the crucial setUser function from AuthContext
  const { user, token, setUser } = useAuth();
  const [booksById, setBooksById] = useState({});
  const [saved, setSaved] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true); // Fetch all books on initial load to create a lookup map.

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const allBooks = await getAllBooks();
        const booksByIdObj = allBooks.reduce((map, book) => {
          map[book.id] = book;
          return map;
        }, {});
        setBooksById(booksByIdObj);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []); // Correctly sync local state from the user object whenever user changes

  useEffect(() => {
    if (user) {
      const savedMap = (user.savedBooks || []).reduce((map, bookId) => {
        map[bookId] = true;
        return map;
      }, {});
      setSaved(savedMap);
      setPlaylists(user.playlists || []);
    } else {
      setSaved({});
      setPlaylists([]);
    }
  }, [user]);
  const toggleSave = useCallback(
    async (bookId) => {
      // --- CRITICAL LOGIC FIX: Check for user/token and throw alert ---
      if (!user || !token) {
        alert("Please log in to save books to library.");
        return;
      }

      const isCurrentlySaved = !!saved[bookId];
      const previousSaved = saved; // Optimistic UI update

      const newSaved = { ...saved };
      if (isCurrentlySaved) {
        delete newSaved[bookId];
      } else {
        newSaved[bookId] = true;
      }
      setSaved(newSaved);

      try {
        let updatedUser; // API call to backend, which now returns the updated user object
        if (isCurrentlySaved) {
          updatedUser = await removeSavedBook(bookId, token);
        } else {
          updatedUser = await addSavedBook(bookId, token);
        }

        // Use the full updated user object from the backend to sync the AuthContext state.
        setUser(updatedUser);
      } catch (error) {
        console.error("Error toggling save:", error);
        setSaved(previousSaved); // Revert on error
      }
    },
    [user, token, saved, setUser]
  ); // Playlist Logic
  const updateAndSyncPlaylists = useCallback(
    async (newPlaylists) => {
      if (!user || !token) return;
      const oldPlaylists = playlists;
      setPlaylists(newPlaylists);
      try {
        await updateUserPlaylists(newPlaylists, token);

        // Update AuthContext state manually with the new playlists.
        setUser((prev) => ({ ...prev, playlists: newPlaylists }));
      } catch (error) {
        console.error("Failed to update playlists:", error);
        setPlaylists(oldPlaylists); // Revert UI on error
      }
    },
    [user, token, playlists, setUser]
  );
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: new Date().getTime().toString(),
      name,
      bookIds: [],
    };
    updateAndSyncPlaylists([...playlists, newPlaylist]);
  };
  const removePlaylist = (playlistId) => {
    const newPlaylists = playlists.filter((p) => p.id !== playlistId);
    updateAndSyncPlaylists(newPlaylists);
  };
  const renamePlaylist = (playlistId, newName) => {
    const newPlaylists = playlists.map((p) =>
      p.id === playlistId ? { ...p, name: newName } : p
    );
    updateAndSyncPlaylists(newPlaylists);
  };
  const addToPlaylist = (playlistId, bookId) => {
    const newPlaylists = playlists.map((p) => {
      if (p.id === playlistId && !p.bookIds.includes(bookId)) {
        return { ...p, bookIds: [...p.bookIds, bookId] };
      }
      return p;
    });
    updateAndSyncPlaylists(newPlaylists);
  };
  const removeFromPlaylist = (playlistId, bookId) => {
    const newPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, bookIds: p.bookIds.filter((id) => id !== bookId) };
      }
      return p;
    });
    updateAndSyncPlaylists(newPlaylists);
  };

  const value = useMemo(
    () => ({
      loading,
      booksById,
      saved,
      playlists,
      toggleSave,
      createPlaylist,
      removePlaylist,
      renamePlaylist,
      addToPlaylist,
      removeFromPlaylist,
    }),
    [loading, booksById, saved, playlists, toggleSave]
  );

  return <LibraryCtx.Provider value={value}>{children}</LibraryCtx.Provider>;
}

export const useLibrary = () => useContext(LibraryCtx);
