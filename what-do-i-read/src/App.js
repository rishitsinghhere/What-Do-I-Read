import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Genres from "./pages/Genres";
import SelectGenres from "./pages/SelectGenres";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";

const Page = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const Private = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Navbar />
        <div className="container">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Page><Home /></Page>} />
              <Route path="/genres" element={<Page><Genres /></Page>} />
              <Route path="/select-genres" element={<Page><SelectGenres /></Page>} />
              <Route path="/books/:genreId" element={<Page><Books /></Page>} />
              <Route path="/book/:bookId" element={<Page><BookDetails /></Page>} />
              <Route path="/profile" element={<Private><Page><Profile /></Page></Private>} />
              <Route path="/about" element={<Page><About /></Page>} />
              <Route path="/auth" element={<Page><Auth /></Page>} />
              <Route path="*" element={<Page><NotFound /></Page>} />
            </Routes>
          </AnimatePresence>
        </div>
      </LibraryProvider>
    </AuthProvider>
  );
}
