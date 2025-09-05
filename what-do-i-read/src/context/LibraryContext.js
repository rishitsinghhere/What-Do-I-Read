import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { booksById, genres } from "../data/books";

const LibCtx = createContext(null);
const SAVED_KEY = "wdir_saved";
const PLAYLISTS_KEY = "wdir_playlists";

export function LibraryProvider({ children }) {
  const [saved, setSaved] = useState(() => {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : {};
  });

  const [playlists, setPlaylists] = useState(() => {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          { id: "default", name: "Saved", bookIds: [] },
        ];
  });

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const toggleSave = (bookId) => {
    setSaved((s) => {
      const next = { ...s };
      if (next[bookId]) delete next[bookId];
      else
        next[bookId] = {
          bookId,
          progress: 0,
          addedAt: Date.now(),
        };
      return next;
    });
    setPlaylists((pls) =>
      pls.map((p) =>
        p.id === "default"
          ? {
              ...p,
              bookIds: saved[bookId]
                ? p.bookIds.filter((id) => id !== bookId)
                : [...new Set([bookId, ...p.bookIds])],
            }
          : p
      )
    );
  };

  const setProgress = (bookId, value) =>
    setSaved((s) => ({ ...s, [bookId]: { ...(s[bookId] || { bookId }), progress: value, addedAt: s[bookId]?.addedAt || Date.now() } }));

  const createPlaylist = (name) => {
    const id = `${name}-${Math.random().toString(36).slice(2, 7)}`;
    setPlaylists((p) => [{ id, name, bookIds: [] }, ...p]);
  };

  const renamePlaylist = (id, name) =>
    setPlaylists((p) => p.map((pl) => (pl.id === id ? { ...pl, name } : pl)));

  const removePlaylist = (id) =>
    setPlaylists((p) => p.filter((pl) => pl.id !== id && pl.id !== "default"));

  const addToPlaylist = (playlistId, bookId) =>
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId
          ? { ...pl, bookIds: [...new Set([bookId, ...pl.bookIds])] }
          : pl
      )
    );

  const removeFromPlaylist = (playlistId, bookId) =>
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId
          ? { ...pl, bookIds: pl.bookIds.filter((id) => id !== bookId) }
          : pl
      )
    );

  const value = useMemo(
    () => ({
      genres,
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
    [saved, playlists]
  );

  return <LibCtx.Provider value={value}>{children}</LibCtx.Provider>;
}

export const useLibrary = () => useContext(LibCtx);
