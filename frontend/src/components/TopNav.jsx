import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/compare", label: "Compare" },
  { to: "/markets", label: "Markets" },
];

function TopNav() {
  return (
    <header className="top-nav-shell">
      <div className="top-nav-brand">AskStocks</div>
      <nav className="top-nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default TopNav;

