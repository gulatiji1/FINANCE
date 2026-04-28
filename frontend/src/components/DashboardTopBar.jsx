import { Bell, Search, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardTopBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (event) => {
    event.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;
    navigate(`/company/${clean}`);
    setQuery("");
  };

  return (
    <header className="top-shell">
      <form className="top-search" onSubmit={submitSearch}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search stock symbol (e.g., TCS)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <div className="top-actions">
        <button type="button" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <div className="user-chip">
          <UserCircle2 size={18} />
          <span>Investor</span>
        </div>
      </div>
    </header>
  );
}

export default DashboardTopBar;

