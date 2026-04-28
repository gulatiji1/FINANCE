import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { searchCompanies } from "../api/marketApi";

function SearchBar({ onSearch, initialValue = "" }) {
  const [input, setInput] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cleanInput = input.trim();
    if (cleanInput.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchCompanies(cleanInput);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [input]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    onSearch(input.trim().toUpperCase());
    setSuggestions([]);
  };

  const chooseSuggestion = (symbol) => {
    setInput(symbol);
    onSearch(symbol);
    setSuggestions([]);
  };

  return (
    <div className="search-box">
      <form className="search-form" onSubmit={handleSubmit}>
        <Search size={18} />
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search any stock (e.g., RELIANCE, TCS)"
          aria-label="Search stock"
        />
        <button type="submit">Analyze</button>
      </form>
      {(loading || suggestions.length > 0) && (
        <div className="search-suggestions">
          {loading && <p className="muted">Searching...</p>}
          {!loading &&
            suggestions.map((item) => (
              <button
                type="button"
                key={item.symbol}
                className="suggestion-item"
                onClick={() => chooseSuggestion(item.symbol)}
              >
                <span>{item.symbol}</span>
                <small>{item.name}</small>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

