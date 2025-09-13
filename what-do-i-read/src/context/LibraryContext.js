import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { updateUserPlaylists, updateUserSavedBooks } from "../mongo";
import { getAnonymousUser } from "../auth";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const LibCtx = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  
  const [booksById, setBooksById] = useState({});
  const [saved, setSaved] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

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
        setPlaylists([]);
      }
    } else {
      // Clear data when no user
      setSaved({});
      setPlaylists([]);
    }
  }, [user]);

  const toggleSave = async (bookId) => {
    if (!user) {
      alert("Please log in to save books to your library.");
      navigate('/auth');
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

    // Update database
    try {
      const newSavedBooks = isSaved
        ? Object.values(saved).filter(book => book.bookId !== bookId)
        : [...Object.values(saved), { bookId, progress: 0, addedAt: Date.now() }];
      
      await updateUserSavedBooks(user._id, newSavedBooks);
      console.log("Book save toggled successfully in database");
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
      navigate("/auth");
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
      console.log("Playlist created successfully in database");
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
      console.log("Playlist renamed successfully in database");
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
      console.log("Playlist removed successfully from database");
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
      console.log("Book added to playlist successfully in database");
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
      console.log("Book removed from playlist successfully in database");
    } catch (error) {
      console.error("Error removing from playlist:", error);
    }
  };

  const setProgress = async (bookId, value) => {
  console.log("setProgress called:", { bookId, value, userId: user?._id });

  if (!user) {
    alert("Please log in to track your reading progress.");
    return;
  }

  // Prepare updated book object
  const updatedBook = {
    ...(saved[bookId] || { bookId }),
    progress: value,
    addedAt: saved[bookId]?.addedAt || Date.now(),
  };

  // Update local state first for UI feedback
  setSaved(prev => ({
    ...prev,
    [bookId]: updatedBook,
  }));

  console.log("Updated local state, now updating database with:", updatedBook);

  // Update only that book in DB
  try {
    const result = await updateUserSavedBooks(user._id, updatedBook);
    console.log("Progress updated successfully in database:", result);
  } catch (error) {
    console.error("Error updating progress in database:", error);
    // Optionally revert local state if needed
    setSaved(saved);
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