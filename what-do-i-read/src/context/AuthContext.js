import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { registerUser, loginUser, updateUserProfile } from "../mongo";

// AUTH CONTEXT - Manages user authentication state and operations

const AuthCtx = createContext(null);
const KEY = "wdir_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });

  // Persist user data to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const userData = await registerUser(username, email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (patch) => {
    try {
      if (user && user._id) {
        await updateUserProfile(user._id, patch);
        const updatedUser = { ...user, ...patch };
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => setUser(null);

  // Memoized context value
  const value = useMemo(
    () => ({ user, setUser, login, register, updateProfile, logout }),
    [user]
  );
  
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);