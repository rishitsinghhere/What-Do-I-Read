import { createContext, useContext, useEffect, useMemo, useState } from "react";
// --- FIX #1: Give the imported functions aliases to prevent naming conflicts ---
// UNCOMMENT THIS LINE:
import { 
  register as apiRegister, 
  login as apiLogin, 
  updateUserProfile as apiUpdateProfile 
} from "../services/api"; 

const AuthCtx = createContext(null);
const USER_KEY = "wdir_user";
const TOKEN_KEY = "wdir_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      // --- FIX #2: Call the imported `apiLogin` function, NOT `login` itself ---
      const { token: receivedToken, user: userData } = await apiLogin(
        email,
        password
      ); // Use the alias
      setUser(userData);
      setToken(receivedToken);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      // --- FIX #3: Call the imported `apiRegister` function, NOT `register` itself ---
      const { token: receivedToken, user: userData } = await apiRegister(
        username,
        email,
        password
      ); // Use the alias
      setUser(userData);
      setToken(receivedToken);
      return userData;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const updateProfile = async (patch) => {
    try {
      if (user && token) {
        const updatedUserData = await apiUpdateProfile(patch, token);
        setUser(updatedUserData);
        return updatedUserData;
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, setUser, login, register, updateProfile, logout }),
    [user, token]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
