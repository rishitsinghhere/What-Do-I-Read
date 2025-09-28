// ABOUT PAGE - Team information, project details and favorite book recommendations

export default function About() {
  return (
    <>
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo4.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

      <div className="container-about">
        {/* About Us Section */}
        <div className="about-developers">
          <h2>About Us</h2>

          <div className="dev-grid">
            <div className="dev-card">
              <img
                src="/Media/pppanda.png"
                alt="Rishit"
                className="profile-pic"
              />
              <h3>Rishit Singh</h3>
              <p className="muted">
                Storyteller, coder, and creator who loves blending creativity
                with technology.
              </p>
              <h4>Hobbies</h4>
              <p className="muted">Reading • Music • Fitness • YouTube</p>
            </div>

            <div className="dev-card">
              <img
                src="/Media/ppmacaw.png"
                alt="Heet"
                className="profile-pic"
              />
              <h3>Heet Solanki</h3>
              <p className="muted">
                Passionate developer who enjoys building backend systems and
                experimenting with frameworks.
              </p>
              <h4>Hobbies</h4>
              <p className="muted">Gaming • Fantasy Books • Tea Lover</p>
            </div>
          </div>
        </div>

        {/* How We Made This Website */}
        <div className="about-card">
          <h2>How We Made This Website</h2>
          <p>
            Built with <strong>React</strong>, this project uses a modular
            structure <br />
            for smooth navigation and clean design, We added features like:
          </p>
          <span className="pill">Genre browsing with curated categories</span>
          <span className="pill">Book detail pages with progress tracking</span>
          <span className="pill">Custom Library-style collections</span>
        </div>

        {/* Did You Know Section */}
        <div className="about-card">
          <h2>Did You Know?</h2>
          <p>Hover over a book cover to reveal some mind-blowing facts!</p>

          <div className="book-grid">
            <div className="book-card">
              <img
                src="https://covers.openlibrary.org/b/id/7984916-L.jpg"
                alt="Harry Potter"
              />
              <div className="overlay">
                <p>
                  The Harry Potter books have been translated into over{" "}
                  <strong>80 languages</strong>, including Latin and Ancient
                  Greek.
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://m.media-amazon.com/images/I/81FPzmB5fgL.jpg"
                alt="The Alchemist"
              />
              <div className="overlay">
                <p>
                  When <strong>The Alchemist </strong>was first published, only
                  900 copies were sold & the publisher dropped it. Today, it has
                  sold over 65 million copies worldwide.
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://m.media-amazon.com/images/I/81tNnqcHxlL._UF1000,1000_QL80_.jpg"
                alt="Sherlock Holmes"
              />
              <div className="overlay">
                <p>
                  Sherlock Holmes is the most portrayed literary character in
                  film & TV history.
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://m.media-amazon.com/images/I/71vfjx-h4wL.jpg"
                alt="who moved my cheese?"
              />
              <div className="overlay">
                <p>
                  This small motivational book about <em>change</em> has sold
                  over 28 million copies and was written in just{" "}
                  <strong>1 day</strong>
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://cdna.artstation.com/p/assets/images/images/066/826/558/large/paige-walshe-p-p-cover-1.jpg?1693875815"
                alt="Pride and Prejudice"
              />
              <div className="overlay">
                <p>
                  <em>Pride and Prejudice</em> has never been out of print since
                  it was published in 1813.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Favourite Books */}
        <div className="about-card">
          <h2>Our Favourite Picks</h2>
          <p>Here are some of the books we absolutely love</p>

          <div className="book-grid">
            <div className="book-card">
              <img
                src="https://m.media-amazon.com/images/I/91868k2+gUL.jpg"
                alt="Favourite Book 1"
              />
              <div className="overlay">
                <p>
                  <strong>Rishit's pick</strong> <hr />
                  Thriller, Creepy yet very Enagaging, The Last 10 pages is were
                  you think of your own existence
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://m.media-amazon.com/images/I/91zOqQ7U5sL._SL1500_.jpg"
                alt="Favourite Book 2"
              />
              <div className="overlay">
                <p>
                  <strong>Heet's pick</strong>
                  <hr />
                  Love dressed in obsession, wrapped in ruin.
                </p>
              </div>
            </div>

            <div className="book-card">
              <img
                src="https://cdn.kobo.com/book-images/fc4a354b-27cd-4b29-8966-26fafb527c94/1200/1200/False/the-art-of-war-deluxe-hardbound-edition.jpg"
                alt="Favourite Book 3"
              />
              <div className="overlay">
                <p>
                  <strong>A classic we both admire</strong>
                  <hr />
                  "Pretend inferiority and encourage his arrogance." -{" "}
                  <em>Sun Tzu</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
