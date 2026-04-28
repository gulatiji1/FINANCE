import {
  ChartCandlestick,
  Gauge,
  LayoutGrid,
  ListChecks,
  Settings,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/company/RELIANCE", label: "Markets", icon: Gauge },
  { to: "/compare", label: "Watchlist", icon: ListChecks },
  { to: "/company/TCS", label: "Portfolio", icon: WalletCards },
  { to: "/company/HDFCBANK", label: "Settings", icon: Settings },
];

function DashboardSidebar() {
  return (
    <aside className="side-shell">
      <div className="brand-lockup">
        <div className="brand-icon">
          <ChartCandlestick size={18} />
        </div>
        <div>
          <p className="brand-title">AskStocks</p>
          <span>NSE / BSE</span>
        </div>
      </div>
      <nav className="side-nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default DashboardSidebar;

