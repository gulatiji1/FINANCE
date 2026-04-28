import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getMarketOverview, getNews } from "../api/marketApi";
import ChatPanel from "../components/ChatPanel";
import LoadingState from "../components/LoadingState";
import SearchBar from "../components/SearchBar";

function formatClock(value) {
  return value
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace("am", "AM")
    .replace("pm", "PM");
}

function formatCompact(value) {
  if (value === null || value === undefined) return "N/A";
  if (Math.abs(value) >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function formatPercent(value) {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(2)}%`;
}

function sentimentFromHeadline(text) {
  const low = (text || "").toLowerCase();
  const positiveWords = ["growth", "beat", "surge", "gain", "strong", "record"];
  const negativeWords = ["fall", "drop", "risk", "weak", "decline", "loss"];
  const pos = positiveWords.some((word) => low.includes(word));
  const neg = negativeWords.some((word) => low.includes(word));
  if (pos && !neg) return { label: "Positive", tone: "positive" };
  if (neg && !pos) return { label: "Negative", tone: "negative" };
  return { label: "Neutral", tone: "neutral" };
}

function HomePage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sectorPe, setSectorPe] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [news, setNews] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError("");
      try {
        const payload = await getMarketOverview(15);
        setRows(payload.rows || []);
        setSectorPe(payload.sector_pe || []);
        const firstSymbol = (payload.rows || [])[0]?.symbol || "";
        setSelectedSymbol(firstSymbol);
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load market overview.");
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  useEffect(() => {
    async function loadNews() {
      if (!selectedSymbol) {
        setNews([]);
        return;
      }
      try {
        const base = selectedSymbol.split(".")[0];
        const items = await getNews(base);
        setNews(items.slice(0, 8));
      } catch {
        setNews([]);
      }
    }
    loadNews();
  }, [selectedSymbol]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.symbol === selectedSymbol) || rows[0] || null,
    [rows, selectedSymbol]
  );
  const trendData = selectedRow?.history || [];

  return (
    <div className="page-wrap">
      <section className="header-row glass-card">
        <SearchBar onSearch={(symbol) => navigate(`/company/${symbol}`)} initialValue="" />
        <div className="live-clock">{formatClock(now)}</div>
      </section>

      {loading && <LoadingState label="Loading market dashboard..." />}
      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <>
          <section className="glass-card">
            <div className="section-head">
              <h3>Live Stock Table</h3>
              <p>Hover rows and tap to update analytics</p>
            </div>
            <div className="table-wrap">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Ticker</th>
                    <th>Price</th>
                    <th>% Change</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.symbol}
                      className={row.symbol === selectedSymbol ? "active" : ""}
                      onMouseEnter={() => setSelectedSymbol(row.symbol)}
                      onClick={() => setSelectedSymbol(row.symbol)}
                    >
                      <td>{row.name}</td>
                      <td>{row.symbol}</td>
                      <td>Rs {formatCompact(row.price)}</td>
                      <td className={row.change_percent >= 0 ? "up" : "down"}>
                        {formatPercent(row.change_percent)}
                      </td>
                      <td>{formatCompact(row.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="analytics-grid-home">
            <article className="glass-card">
              <div className="section-head">
                <h3>Stock Price Tracking</h3>
                <p>{selectedRow ? `${selectedRow.name}` : "Select a stock"}</p>
              </div>
              <div className="chart-slot">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(23,23,23,0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => `Rs ${formatCompact(value)}`} />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#ff6a00"
                      strokeWidth={2.6}
                      dot={false}
                      isAnimationActive
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-head">
                <h3>Sector P/E Ratio</h3>
                <p>Average by sector</p>
              </div>
              <div className="chart-slot">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sectorPe}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(23,23,23,0.08)" />
                    <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-12} height={54} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
                    <Bar dataKey="pe_ratio" fill="#ff8c33" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="glass-card">
            <div className="section-head">
              <h3>Market News</h3>
              <p>Intelligence layer</p>
            </div>
            <div className="news-feed">
              {news.map((item) => {
                const sentiment = sentimentFromHeadline(item.title);
                return (
                  <a className="news-feed-item" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                    <div>
                      <h4>{item.title}</h4>
                      <span>
                        {item.source} | {item.published_at?.slice(0, 16).replace("T", " ") || "N/A"}
                      </span>
                    </div>
                    <span className={`sentiment ${sentiment.tone}`}>{sentiment.label}</span>
                  </a>
                );
              })}
            </div>
          </section>

          <ChatPanel symbol={selectedSymbol ? selectedSymbol.split(".")[0] : null} showExamples />
        </>
      )}
    </div>
  );
}

export default HomePage;
