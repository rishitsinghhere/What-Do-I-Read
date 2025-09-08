import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { registerUser, loginUser, updateUserProfile } from "../mongo";

const AuthCtx = createContext(null);
const KEY = "wdir_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const userData = await registerUser(username, email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

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

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, login, register, updateProfile, logout }),
    [user]
  );
  
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);