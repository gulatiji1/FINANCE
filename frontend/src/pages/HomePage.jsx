import { ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import SearchBar from "../components/SearchBar";

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (symbol) => {
    navigate(`/company/${symbol}`);
  };

  const scrollToChat = () => {
    const chatSection = document.getElementById("chat-section");
    if (chatSection) chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">NSE/BSE Equity Intelligence</p>
          <h1>Understand the Market. Make Smarter Decisions.</h1>
          <p className="hero-subheading">
            Explore companies, analyze stocks, and get AI-powered insights.
          </p>
          <SearchBar onSearch={handleSearch} />
          <button type="button" className="scroll-trigger" onClick={scrollToChat}>
            Ask Anything About Stocks <ArrowDown size={16} />
          </button>
        </div>
      </section>

      <section className="feature-band">
        <article>
          <h3>Company Intelligence</h3>
          <p>Company profile, valuation markers, leadership context, and AI business-model explanation.</p>
        </article>
        <article>
          <h3>Market Analytics</h3>
          <p>Trend indicators, returns, volatility, moving averages, and historical chart interaction.</p>
        </article>
        <article>
          <h3>AI Research Assistant</h3>
          <p>Ask natural-language questions and get structured summary, growth, risk, and insight outputs.</p>
        </article>
      </section>

      <section id="chat-section" className="chat-section">
        <ChatPanel showExamples />
      </section>
    </div>
  );
}

export default HomePage;

