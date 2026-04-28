import { BarChart3, ChartCandlestick, Home } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/compare", label: "Compare", icon: BarChart3 },
];

function Navbar() {
  return (
    <header className="top-nav">
      <div className="nav-brand">
        <ChartCandlestick size={20} />
        <span>India Equity AI</span>
      </div>
      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;

