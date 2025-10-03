// in /src/pages/Home.jsx

import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { useEffect, useRef, useState } from "react";
// --- CHANGE #1: Remove all Realm and auth imports ---
// import { getAnonymousUser } from "../auth";
// import * as Realm from "realm-web";

// --- CHANGE #2: Import the new API function ---
import { getFeaturedBooks } from "../services/api";


export default function Home() {
  const nav = useNavigate();
  const [featured, setFeatured] = useState([]);

  // --- All your refs and animation logic remain untouched ---
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const halfWRef = useRef(0);

  // --- CHANGE #3: Update the data fetching useEffect ---
  useEffect(() => {
    async function fetchBooks() {
      try {
        const featuredBooks = await getFeaturedBooks();
        setFeatured(featuredBooks);
      } catch (error) {
        console.error("Error fetching featured books:", error);
      }
    }
    fetchBooks();
  }, []);

  // --- No changes needed for the animation useEffect ---
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const computeHalfWidth = () => {
      halfWRef.current = track.scrollWidth / 2;
    };
    computeHalfWidth();

    const ro = new ResizeObserver(() => computeHalfWidth());
    ro.observe(track);

    let rafId;
    let last = performance.now();
    const SPEED = 60; // px/sec

    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      xRef.current -= SPEED * dt;
      const half = halfWRef.current;

      if (half > 0 && -xRef.current >= half) {
        xRef.current += half;
      }

      track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [featured.length]);

  const looped = [...featured, ...featured];

  // --- No changes needed for your JSX below this line ---
  return (
    <>
      {/* Background video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo3.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

      {/* HOME CONTENT */}
      <div className="container-home">
        {/* TITLE */}
        <div className="home-title">
          <h1>What Do I Read ?</h1>
          <p className="subtitle">
            Your personalized gateway to new books, genres, and reading
            journeys.
          </p>
          <button className="btn primary" onClick={() => nav("/select-genres")}>
            Select Genres
          </button>
        </div>

        {/* TRENDING PICKS */}
        <h2 className="label">Trending Picks</h2>
        <div className="card section">
          <div
            ref={viewportRef}
            className="list-h"
            style={{
              marginTop: 0,
              overflow: "hidden",
              position: "relative",
              touchAction: "pan-y",
            }}
            onWheel={(e) => {
              if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
            }}
          >
            <div
              ref={trackRef}
              style={{
                display: "flex",
                gap: 20,
                willChange: "transform",
                transform: "translate3d(0,0,0)",
              }}
            >
              {looped.map((b, i) => (
                <div key={`${b.id}-${i}`} style={{ flex: "0 0 auto" }}>
                  <BookCard book={b} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <h2 className="label">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Pick Genres</h3>
            <p>Select the genres you love or want to explore.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Explore & Save</h3>
            <p>Browse books, build custom libraries</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Create Notes</h3>
            <p>Capture thoughts & insights from every book</p>
          </div>
        </div>

        {/* FEATURES */}
        <h2 className="label">Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Custom Libraries</h3>
            <p>Save books into collections that match your vibe.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Notes</h3>
            <p>Add personal notes & track your reading thoughts.</p>
          </div>
          <div className="feature-card">
            <h3>Genre Library</h3>
            <p>Dedicated genre pages with curated recommendations.</p>
          </div>
          <div className="feature-card">
            <h3>Trending Now</h3>
            <p>See what other readers are discovering right now.</p>
          </div>
        </div>
      </div>
    </>
  );
}