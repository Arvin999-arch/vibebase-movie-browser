
// src/api/tmdb.js
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Debug log (REMOVE LATER)
console.log("API KEY:", API_KEY);

// Helper function to handle responses
const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json();
    console.error("TMDB ERROR:", data);
    throw new Error(data.status_message || "API error");
  }
  return res.json();
};

export const getPopularMovies = async () => {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await handleResponse(res);
  return data.results; // Changed from data.result to data.results
};

// SEARCH
export const searchMovies = async (query) => {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
  );
  const data = await handleResponse(res);
  return data.results; // Changed from data.result to data.results
};

// DETAILS
export const getMovieDetails = async (id) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
  );
  const data = await handleResponse(res);
  return data; // Return full movie object, not data.results
};

// VIDEOS
export const getMovieVideos = async (id) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
  );
  const data = await handleResponse(res);
  return data.results;
};

// SIMILAR MOVIES
export const getSimilarMovies = async (id) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await handleResponse(res);
  return data.results;
};