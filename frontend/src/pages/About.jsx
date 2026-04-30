import React from "react";
// pages/About.jsx
function About() {
    return (
        <div className="about-page">
        <div className="about-content">
             <h1>About VibeBase</h1>
              <p>Your ultimate movie browsing experience!</p>
                
        <div className="about-section">
            <h2>Our Mission</h2>
             <p>VibeBase is designed to help movie lovers discover, explore, and enjoy films from around the world. We provide up-to-date information on popular movies, top ratings, and upcoming releases.</p>
        </div>

        <div className="about-section">
            <h2>Features</h2>
          <ul>
             <li>Browse thousands of movies</li>
             <li>Search by title, genre, or actor</li>
             <li>View detailed movie information</li>
             <li>See cast and crew details</li>
             <li>Read movie overviews and ratings</li>
             <li>Discover popular, top-rated, and upcoming movies</li>
          </ul>
        </div>

        <div className="about-section">
            <h2>Tech Stack</h2>
             <p>Built with React, React Router, and The Movie Database (TMDB) API.</p>
        </div>

        <div className="about-section">
            <h2> Contact</h2>
            <p>Have questions or suggestions? Reach out to us at support@vibebase.com</p>
        </div>
        </div>
        </div>
    );
}

export default About;