import { BarChart3, Briefcase, Home, ListChecks, Settings2 } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/company/RELIANCE", icon: BarChart3, label: "Markets" },
  { to: "/compare", icon: ListChecks, label: "Watchlist" },
  { to: "/company/TCS", icon: Briefcase, label: "Portfolio" },
  { to: "/company/HDFCBANK", icon: Settings2, label: "Settings" },
];

function MobileBottomNav() {
  return (
    <nav className="mobile-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`}>
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileBottomNav;

