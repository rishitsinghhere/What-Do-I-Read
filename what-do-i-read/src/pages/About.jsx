export default function About() {
  return (
<>
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo4.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

    <div className="container-about">
      
      {/* Section: About Us */}
      <div
        className="card"
        style={{
          padding: 18,
          marginTop: 20,
          background: "linear-gradient(180deg, rgba(0,0,0,0.6))",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>About Us</h2>

        <div className="dev-grid">
          {/* Rishit's Card */}
          <div className="dev-card">
            <img 
              src="/Media/pppanda.png"
              alt="Rishit"
              className="profile-pic"
            />
            <h3>Rishit Singh</h3>
            <p className="muted">
              Storyteller, coder, and creator who loves blending creativity with
              technology.
            </p>
            <h4>Hobbies</h4>
            <p className="muted"> Reading • Music • Fitness • YouTube</p>
          </div>

          {/* Friend's Card */}
          <div className="dev-card">
            <img
              src="/Media/ppmacaw.png"
              alt="Heet"
              className="profile-pic"
            />
            <h3>Heet Solanki</h3>
            <p className="muted">
              Passionate developer who enjoys building
              backend systems and experimenting with frameworks.
            </p>
            <h4>Hobbies</h4>
            <p className="muted">Gaming • Fantasy Books • Coffee Lover</p>
          </div>
        </div>
      </div>

     
      {/* Section 2: How We Made This Website */}
      <div className="about-card">
        <h2>How We Made This Website</h2>
        <p>
          Built with <strong>React</strong>, this project uses a modular structure <br></br>
          for smooth navigation and clean design, We added features like:
        </p>
        <span className="pill">Genre browsing with curated categories</span>
        <span className="pill">Book detail pages with progress tracking</span>
        <span className="pill">Custom Library-style collections</span>
      </div>

      {/* Section 3: Did You Know? */}
      <div className="about-card">
        <h2>Did You Know?</h2>
        <p>Hover over a book cover to reveal some mind-blowing facts!</p>

        <div className="book-grid">
          <div className="book-card">
            <img src="https://covers.openlibrary.org/b/id/7984916-L.jpg" alt="Harry Potter" />
            <div className="overlay">
              <p>The Harry Potter books have been translated into over <strong>80 languages</strong>, including Latin and Ancient Greek.</p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://m.media-amazon.com/images/I/81FPzmB5fgL.jpg" alt="The Alchemist" />
            <div className="overlay">
              <p>When <strong>The Alchemist </strong>was first published, only 900 copies were sold & the publisher dropped it. Today, it has sold over 65 million copies worldwide.</p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://m.media-amazon.com/images/I/81tNnqcHxlL._UF1000,1000_QL80_.jpg" alt="Sherlock Holmes" />
            <div className="overlay">
              <p>Sherlock Holmes is the most portrayed literary character in film & TV history.</p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://m.media-amazon.com/images/I/71vfjx-h4wL.jpg" alt="who moved my cheese?" />
            <div className="overlay">
              <p>This small motivational book about <em>change</em> has sold over 28 million copies and was written in just <strong>1 day</strong></p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://cdna.artstation.com/p/assets/images/images/066/826/558/large/paige-walshe-p-p-cover-1.jpg?1693875815" alt="Pride and Prejudice" />
            <div className="overlay">
              <p><em>Pride and Prejudice</em> has never been out of print since it was published in 1813.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Our Favourite Books */}
      <div className="about-card">
        <h2>Our Favourite Picks</h2>
        <p>Here are some of the books we absolutely love</p>

        <div className="book-grid">
          <div className="book-card">
            <img src="https://m.media-amazon.com/images/I/91868k2+gUL.jpg" alt="Favourite Book 1" />
            <div className="overlay">
              <p><strong>Rishit’s pick</strong> <hr></hr>Thriller, Creepy yet very Enagaging, The Last 10 pages is were you think of your own existence</p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://m.media-amazon.com/images/I/61jl29eQPSL._UF1000,1000_QL80_.jpg" alt="Favourite Book 2" />
            <div className="overlay">
              <p><strong>Heet's pick</strong><hr></hr>Lots & Lots of Bloodshed, But that's what I like</p>
            </div>
          </div>

          <div className="book-card">
            <img src="https://cdn.kobo.com/book-images/fc4a354b-27cd-4b29-8966-26fafb527c94/1200/1200/False/the-art-of-war-deluxe-hardbound-edition.jpg" alt="Favourite Book 3" />
            <div className="overlay">
              <p><strong>A classic we both admire</strong><hr></hr>"Pretend inferiority and encourage his arrogance." - <em>Sun Tzu</em></p>
            </div>
          </div>
        </div>
      </div>

      {/* Styling */}
      <style jsx>{`
        .about-card {
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.6));
          color: #f1f1f1;
          padding: 24px;
          margin-bottom: 24px;
          margin-top: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .about-card h2 {
          margin-bottom: 8px;
          margin-top: 5px;
        }
         
        .about-card .pill {
          padding: 10px 20px;
          border: 1px solid var(--border);
          background: var(--soft);
          border-radius: 999px;
          font-size: 14px;
          margin: 10px;
        }

        
        .about-card p  {
          margin-top: 0;
          margin-bottom: 30px;
        }

        .book-grid {
          display: flex;
          justify-content: space-between; 
          align-items: center;   
          gap: 20px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .book-card {
          position: relative;
          width: 180px;
          height: 260px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        }

        .book-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.4s ease;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .book-card:hover img {
          opacity: 0.3;
        }

        .book-card:hover .overlay {
          opacity: 1;
        }
      `}</style>
    </div>
    </>
  );
}
