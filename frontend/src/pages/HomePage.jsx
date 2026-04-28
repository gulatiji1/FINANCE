import { ArrowUpRight, CircleDollarSign, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import SearchBar from "../components/SearchBar";

const quickStats = [
  { label: "NSE Leaders", value: "50+", icon: TrendingUp },
  { label: "AI Insights", value: "Realtime", icon: Sparkles },
  { label: "Market Coverage", value: "NSE/BSE", icon: CircleDollarSign },
];

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (symbol) => {
    navigate(`/company/${symbol}`);
  };

  return (
    <div className="dashboard-page">
      <section className="welcome-strip glass-card">
        <div>
          <p className="eyebrow">AI Stock Research Assistant</p>
          <h1>Understand the Market. Make Smarter Decisions.</h1>
          <p className="subtle-text">
            Explore companies, analyze stocks, and get AI-powered insights.
          </p>
        </div>
        <div className="quick-actions">
          <button type="button" onClick={() => navigate("/company/TCS")}>
            Analyze TCS <ArrowUpRight size={14} />
          </button>
          <button type="button" onClick={() => navigate("/compare")}>
            Compare Stocks <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      <section className="search-zone glass-card">
        <SearchBar onSearch={handleSearch} />
      </section>

      <section className="kpi-strip">
        {quickStats.map(({ label, value, icon: Icon }) => (
          <article className="kpi-item glass-card" key={label}>
            <div className="kpi-title">
              <Icon size={15} />
              <span>{label}</span>
            </div>
            <h3>{value}</h3>
          </article>
        ))}
      </section>

      <section className="chat-section">
        <ChatPanel showExamples />
      </section>
    </div>
  );
}

export default HomePage;
