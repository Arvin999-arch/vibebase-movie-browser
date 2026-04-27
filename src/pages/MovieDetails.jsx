
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getMovieDetails,
    getMovieVideos,
    getSimilarMovies
} from "../services/api"; // Changed from ../api/tmdb to ../services/api
import MovieCard from "../component/MovieCard"; // Assuming component folder

function MovieDetails() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [videos, setVideos] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieDetails(id);
                const videoData = await getMovieVideos(id);
                const similarData = await getSimilarMovies(id);
                
                setMovie(movieData);
                setVideos(videoData.results || []); // Extract results array
                setSimilar(similarData.results || []); // Extract results array
            } catch (err) {
                console.error("Error loading movie details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading movie details...</p>
            </div>
        );
    }

    if (!movie) return <p>Movie not found</p>;

    // Get trailer (YouTube official trailer)
    const trailer = videos.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    return (
        <div className="movie-details-page">
            {/* BACKDROP */}
            <div
                className="movie-backdrop"
                style={{
                    backgroundImage: movie.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                        : "none"
                }}
            />

            {/* MAIN INFO */}
            <div className="movie-details-content">
                <div className="movie-poster">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                    />
                </div>

                <div className="movie-info">
                    <h1>{movie.title}</h1>
                    <p className="tagline">{movie.tagline}</p>
                    
                    <div className="meta">
                        <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                        <span>{movie.runtime} min</span>
                        <span>{movie.release_date?.split("-")[0]}</span>
                    </div>

                    <p className="overview">{movie.overview}</p>

                    <div className="genres">
                        {movie.genres?.map((g) => (
                            <span key={g.id} className="genre">
                                {g.name}
                            </span>
                        ))}
                    </div>

                    {/* TRAILER */}
                    {trailer && (
                        <div className="trailer">
                            <h3>Official Trailer</h3>
                            <iframe
                                width="100%"
                                height="400"
                                src={`https://www.youtube.com/embed/${trailer.key}`}
                                title="Trailer"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>

            {/* SIMILAR MOVIES */}
            <div className="similar-section">
                <h2>Similar Movies</h2>
                <div className="movies-grid">
                    {similar.slice(0, 10).map((m) => (
                        <MovieCard key={m.id} movie={m} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;





