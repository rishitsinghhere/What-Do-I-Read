import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { updateUserPlaylists, updateUserSavedBooks } from "../mongo";
import { getAnonymousUser } from "../auth";
import { useAuth } from "./AuthContext";

const LibCtx = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  
  const [booksById, setBooksById] = useState({});
  const [saved, setSaved] = useState({});
  const [playlists, setPlaylists] = useState([{ id: "default", name: "Saved", bookIds: [] }]);

  // Fetch all books from database on component mount
  useEffect(() => {
    async function fetchAllBooks() {
      try {
        const anonymousUser = await getAnonymousUser();
        const mongodb = anonymousUser.mongoClient("mongodb-atlas");
        const booksCollection = mongodb.db("What-Do-I-Read").collection("books");
        
        const allBooks = await booksCollection.find({});
        
        // Convert to booksById object
        const booksByIdObj = {};
        allBooks.forEach(book => {
          booksByIdObj[book.id] = book;
        });
        
        setBooksById(booksByIdObj);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }

    fetchAllBooks();
  }, []);

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      // Load saved books
      if (user.savedBooks) {
        const savedObj = {};
        user.savedBooks.forEach(book => {
          savedObj[book.bookId] = book;
        });
        setSaved(savedObj);
      } else {
        setSaved({});
      }

      // Load playlists
      if (user.playlists) {
        setPlaylists(user.playlists);
      } else {
        setPlaylists([{ id: "default", name: "Saved", bookIds: [] }]);
      }
    } else {
      // Clear data when no user
      setSaved({});
      setPlaylists([{ id: "default", name: "Saved", bookIds: [] }]);
    }
  }, [user]);

  const toggleSave = async (bookId) => {
    if (!user) {
      alert("Please log in to save books.");
      return;
    }

    const isSaved = !!saved[bookId];
    
    // Update local state immediately
    setSaved((s) => {
      const next = { ...s };
      if (isSaved) {
        delete next[bookId];
      } else {
        next[bookId] = {
          bookId,
          progress: 0,
          addedAt: Date.now(),
        };
      }
      return next;
    });
    
    // Update default playlist
    setPlaylists((pls) =>
      pls.map((p) =>
        p.id === "default"
          ? {
              ...p,
              bookIds: isSaved
                ? p.bookIds.filter((id) => id !== bookId)
                : [...new Set([bookId, ...p.bookIds])],
            }
          : p
      )
    );

    // Update database
    try {
      const newSavedBooks = isSaved
        ? Object.values(saved).filter(book => book.bookId !== bookId)
        : [...Object.values(saved), { bookId, progress: 0, addedAt: Date.now() }];
      
      await updateUserSavedBooks(user._id, newSavedBooks);
      
      // Update playlists in database too
      const updatedPlaylists = playlists.map((p) =>
        p.id === "default"
          ? {
              ...p,
              bookIds: isSaved
                ? p.bookIds.filter((id) => id !== bookId)
                : [...new Set([bookId, ...p.bookIds])],
            }
          : p
      );
      await updateUserPlaylists(user._id, updatedPlaylists);
    } catch (error) {
      console.error("Error saving book:", error);
      // Revert local state on error
      setSaved((s) => {
        const reverted = { ...s };
        if (!isSaved) {
          delete reverted[bookId];
        } else {
          reverted[bookId] = { bookId, progress: 0, addedAt: Date.now() };
        }
        return reverted;
      });
    }
  };

  const createPlaylist = async (name) => {
    if (!user) {
      alert("Please log in to create playlists.");
      return;
    }

    const id = `${name}-${Math.random().toString(36).slice(2, 7)}`;
    const newPlaylist = { id, name, bookIds: [] };
    
    // Update local state
    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);

    // Update database
    try {
      await updateUserPlaylists(user._id, newPlaylists);
    } catch (error) {
      console.error("Error creating playlist:", error);
      // Revert on error
      setPlaylists(playlists);
    }
  };

  const renamePlaylist = async (id, name) => {
    if (!user) return;

    // Update local state
    const updatedPlaylists = playlists.map((pl) => (pl.id === id ? { ...pl, name } : pl));
    setPlaylists(updatedPlaylists);

    // Update database
    try {
      await updateUserPlaylists(user._id, updatedPlaylists);
    } catch (error) {
      console.error("Error renaming playlist:", error);
    }
  };

  const removePlaylist = async (id) => {
    if (!user) return;

    // Update local state
    const updatedPlaylists = playlists.filter((pl) => pl.id !== id);
    setPlaylists(updatedPlaylists);

    // Update database
    try {
      await updateUserPlaylists(user._id, updatedPlaylists);
    } catch (error) {
      console.error("Error removing playlist:", error);
      // Revert on error
      setPlaylists(playlists);
    }
  };

  const addToPlaylist = async (playlistId, bookId) => {
    if (!user) {
      alert("Please log in to add books to playlists.");
      return;
    }

    // Update local state
    const updatedPlaylists = playlists.map((pl) =>
      pl.id === playlistId
        ? { ...pl, bookIds: [...new Set([...pl.bookIds, bookId])] }
        : pl
    );
    setPlaylists(updatedPlaylists);

    // Update database
    try {
      await updateUserPlaylists(user._id, updatedPlaylists);
    } catch (error) {
      console.error("Error adding to playlist:", error);
    }
  };

  const removeFromPlaylist = async (playlistId, bookId) => {
    if (!user) return;

    // Update local state
    const updatedPlaylists = playlists.map((pl) =>
      pl.id === playlistId
        ? { ...pl, bookIds: pl.bookIds.filter((id) => id !== bookId) }
        : pl
    );
    setPlaylists(updatedPlaylists);

    // Update database
    try {
      await updateUserPlaylists(user._id, updatedPlaylists);
    } catch (error) {
      console.error("Error removing from playlist:", error);
    }
  };

  const setProgress = async (bookId, value) => {
    if (!user) return;

    // Update local state
    const updatedSaved = { 
      ...saved, 
      [bookId]: { 
        ...(saved[bookId] || { bookId }), 
        progress: value, 
        addedAt: saved[bookId]?.addedAt || Date.now() 
      } 
    };
    setSaved(updatedSaved);

    // Update database
    try {
      await updateUserSavedBooks(user._id, Object.values(updatedSaved));
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const value = useMemo(
    () => ({
      booksById,
      saved,
      playlists,
      toggleSave,
      setProgress,
      createPlaylist,
      renamePlaylist,
      removePlaylist,
      addToPlaylist,
      removeFromPlaylist,
    }),
    [saved, playlists, booksById, user]
  );

  return <LibCtx.Provider value={value}>{children}</LibCtx.Provider>;
}

export const useLibrary = () => {
  const context = useContext(LibCtx);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};