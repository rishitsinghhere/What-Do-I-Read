import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  const login = (email, password) => {
    const name = email.split("@")[0];
    const photo = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(
      name
    )}`;
    setUser({ email, name, photo });
  };

  const register = (name, email, password) => {
    const photo = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(
      name
    )}`;
    setUser({ email, name, photo });
  };

  const updateProfile = (patch) => setUser((u) => ({ ...u, ...patch }));
  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, login, register, updateProfile, logout }),
    [user]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
