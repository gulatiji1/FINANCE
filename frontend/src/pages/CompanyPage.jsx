import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAnalytics, getCompany, getInsights, getNews } from "../api/marketApi";
import ChatPanel from "../components/ChatPanel";
import InsightsPanel from "../components/InsightsPanel";
import LoadingState from "../components/LoadingState";
import MetricCard from "../components/MetricCard";
import NewsList from "../components/NewsList";
import SearchBar from "../components/SearchBar";
import StockChart from "../components/StockChart";

function formatMarketCap(value) {
  if (value === null || value === undefined) return "N/A";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function CompanyPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!symbol) return;
      setLoading(true);
      setError("");
      try {
        const [companyData, analyticsData, insightsData, newsData] = await Promise.all([
          getCompany(symbol),
          getAnalytics(symbol),
          getInsights(symbol),
          getNews(symbol),
        ]);
        setCompany(companyData);
        setAnalytics(analyticsData);
        setInsights(insightsData);
        setNews(newsData);
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load company data right now.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [symbol]);

  const metricConfig = useMemo(() => {
    if (!company || !analytics) return [];
    return [
      { label: "Market Cap", value: company.overview.market_cap },
      { label: "Revenue", value: company.key_stats.revenue },
      { label: "Profit Margin", value: company.key_stats.profit_margin, isPercent: true },
      { label: "ROE", value: company.key_stats.roe, isPercent: true },
      { label: "Returns", value: analytics.returns !== null ? `${analytics.returns.toFixed(2)}%` : "N/A" },
      { label: "Volatility", value: analytics.volatility !== null ? `${analytics.volatility.toFixed(2)}%` : "N/A" },
    ];
  }, [company, analytics]);

  const handleSearch = (nextSymbol) => navigate(`/company/${nextSymbol}`);

  return (
    <div className="page company-page">
      <section className="page-header">
        <SearchBar onSearch={handleSearch} initialValue={symbol || ""} />
      </section>

      {loading && <LoadingState label="Loading company intelligence..." />}
      {!loading && error && (
        <div className="error-box">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && company && analytics && insights && (
        <>
          <section className="panel overview-panel">
            <div className="panel-header">
              <h3>Company Overview</h3>
              <p>
                {company.overview.exchange_symbol} | {company.overview.sector || "Sector N/A"}
              </p>
            </div>
            <div className="overview-grid">
              <article>
                <h2>{company.overview.name}</h2>
                <p>{company.overview.description || "No description available."}</p>
                <div className="overview-meta">
                  <span>CEO: {company.overview.ceo || "N/A"}</span>
                  <span>Market Cap: {formatMarketCap(company.overview.market_cap)}</span>
                </div>
              </article>
              <article>
                <h4>Business Model (AI)</h4>
                <p>{insights.business_model}</p>
              </article>
            </div>
          </section>

          <section className="metric-grid">
            {metricConfig.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} isPercent={metric.isPercent} />
            ))}
          </section>

          <StockChart data={company.chart_data} />

          <section className="panel analytics-panel">
            <div className="panel-header">
              <h3>Analytics Layer</h3>
              <p>Computed metrics and trend indicators</p>
            </div>
            <div className="analytics-grid">
              <article>
                <h4>Returns</h4>
                <p>{analytics.returns?.toFixed(2) ?? "N/A"}%</p>
              </article>
              <article>
                <h4>Volatility</h4>
                <p>{analytics.volatility?.toFixed(2) ?? "N/A"}%</p>
              </article>
              <article>
                <h4>Trend</h4>
                <p>{analytics.trend}</p>
              </article>
              <article>
                <h4>Moving Averages</h4>
                <p>MA20: {analytics.moving_averages.ma20?.toFixed(2) ?? "N/A"}</p>
                <p>MA50: {analytics.moving_averages.ma50?.toFixed(2) ?? "N/A"}</p>
                <p>MA200: {analytics.moving_averages.ma200?.toFixed(2) ?? "N/A"}</p>
              </article>
            </div>
          </section>

          <InsightsPanel insights={insights} />
          <NewsList items={news} />
          <ChatPanel symbol={symbol} />
        </>
      )}
    </div>
  );
}

export default CompanyPage;
