
// src/component/SearchBar.jsx
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';


function SearchBar() {
  const { searchQuery, setSearchQuery } = useMovies();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <span className="search-icon"></span>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Search for movies by title..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        {searchQuery && (
          <button className="search-clear" onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;