
// src/services/api.js
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Helper to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.status_message || errorMessage;
    } catch {
      // Ignore JSON parsing error
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper to ensure API key exists
const requireApiKey = () => {
  if (!API_KEY) {
    throw new Error(
      "TMDB API key is missing. Please add VITE_TMDB_API_KEY to your .env file and restart the dev server."
    );
  }
};

// Helper to log only in development
const logDev = (message, data) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

export const getPopularMovies = async () => {
  try {
    requireApiKey();
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    logDev("Fetching popular movies from:", url.replace(API_KEY, "HIDDEN"));
    
    const response = await fetch(url);
    const data = await handleResponse(response);
    
    logDev("Movies received:", data.results?.length || 0);
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    throw new Error(`Popular movies error: ${error.message}`);
  }
};

export const searchMovies = async (query) => {
  if (!query || query.trim() === "") return [];
  
  try {
    requireApiKey();
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
    logDev("Searching movies from:", url.replace(API_KEY, "HIDDEN"));
    
    const response = await fetch(url);
    const data = await handleResponse(response);
    
    logDev("Search results:", data.results?.length || 0);
    return data.results || [];
  } catch (error) {
    console.error("Failed to search movies:", error);
    throw new Error(`Search error: ${error.message}`);
  }
};

export const getMovieDetails = async (id) => {
  try {
    requireApiKey();
    const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);
    return handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    throw new Error(`Details error: ${error.message}`);
  }
};

export const getMovieVideos = async (id) => {
  try {
    requireApiKey();
    const url = `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch movie videos:", error);
    return [];
  }
};

export const getSimilarMovies = async (id) => {
  try {
    requireApiKey();
    const url = `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch similar movies:", error);
    return [];
  }
};

