import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { updateUserPlaylists, updateUserSavedBooks } from "../mongo";
import { getAnonymousUser } from "../auth";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import * as Realm from "realm-web";

const LibCtx = createContext(null);

export function LibraryProvider({ children }) {
  const { user, setUser } = useAuth();
  
  const [booksById, setBooksById] = useState({});
  const [saved, setSaved] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
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

  // Function to refresh user data from MongoDB
  const refreshUserFromDB = async (userId) => {
    try {
      setIsLoadingUserData(true);
      console.log("Refreshing user data from MongoDB for user:", userId);
      
      const anonymousUser = await getAnonymousUser();
      const mongodb = anonymousUser.mongoClient("mongodb-atlas");
      const usersCollection = mongodb.db("What-Do-I-Read").collection("users");
      
      // Convert string ID to ObjectId if needed
      const objectId = typeof userId === "string" ? new Realm.BSON.ObjectId(userId) : userId;
      const freshUserData = await usersCollection.findOne({ _id: objectId });
      
      if (freshUserData) {
        console.log("Fresh user data loaded from DB:", freshUserData.savedBooks?.length || 0, "saved books");
        
        // Update user in AuthContext (this will trigger the next useEffect)
        setUser(freshUserData);
        
        return freshUserData;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing user data from MongoDB:", error);
      return null;
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Load user data from context/localStorage on mount and when user changes
  useEffect(() => {
    console.log("User changed in LibraryContext:", user?.name, "Saved books count:", user?.savedBooks?.length || 0);
    
    if (user && user._id) {
      // Load saved books from user object
      if (user.savedBooks && Array.isArray(user.savedBooks)) {
        const savedObj = {};
        user.savedBooks.forEach(book => {
          savedObj[book.bookId] = book;
        });
        setSaved(savedObj);
        console.log("Loaded saved books from user object:", Object.keys(savedObj).length);
      } else {
        setSaved({});
        console.log("No saved books found in user object");
      }

      // Load playlists from user object
      if (user.playlists && Array.isArray(user.playlists)) {
        setPlaylists(user.playlists);
      } else {
        setPlaylists([]);
      }
    } else {
      // Clear data when no user
      setSaved({});
      setPlaylists([]);
      console.log("No user, clearing saved books and playlists");
    }
  }, [user]);

  // Refresh user data from MongoDB on initial load
  useEffect(() => {
    if (user && user._id && !isLoadingUserData) {
      // Only refresh if we haven't already loaded fresh data
      // This prevents infinite loops but ensures we get fresh data on app start
      refreshUserFromDB(user._id);
    }
  }, []); // Empty dependency array - only run once on mount

  const toggleSave = async (bookId) => {
    if (!user) {
      alert("Please log in to save books to your library.");
      navigate('/auth');
      return;
    }

    const isSaved = !!saved[bookId];
    console.log("Toggling save for book:", bookId, "Currently saved:", isSaved);
    
    try {
      if (isSaved) {
        // Remove book from saved
        await updateUserSavedBooks(user._id, bookId, "remove");
        console.log("Book removed from database");
        
        // Update local state
        setSaved((s) => {
          const next = { ...s };
          delete next[bookId];
          return next;
        });
      } else {
        // Add book to saved
        const newSavedBook = {
          bookId,
          progress: 0,
          addedAt: Date.now(),
        };
        
        await updateUserSavedBooks(user._id, newSavedBook, "add");
        console.log("Book added to database");
        
        // Update local state
        setSaved((s) => ({
          ...s,
          [bookId]: newSavedBook,
        }));
      }
      
      // Refresh user data from database to keep everything in sync
      await refreshUserFromDB(user._id);
      
      console.log("Book save toggled successfully");
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Error saving book. Please try again.");
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
      await refreshUserFromDB(user._id);
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
      await refreshUserFromDB(user._id);
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
      await refreshUserFromDB(user._id);
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
      await refreshUserFromDB(user._id);
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
      await refreshUserFromDB(user._id);
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

    // Update progress in DB
    try {
      await updateUserSavedBooks(user._id, updatedBook, "updateProgress");
      await refreshUserFromDB(user._id);
      console.log("Progress updated successfully in database");
    } catch (error) {
      console.error("Error updating progress in database:", error);
      // Revert local state if needed
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
      refreshUserFromDB,
      isLoadingUserData,
    }),
    [saved, playlists, booksById, user, isLoadingUserData]
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