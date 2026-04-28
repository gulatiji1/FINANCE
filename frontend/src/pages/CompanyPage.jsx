import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Globe2,
  IndianRupee,
  Landmark,
  LineChart,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { getAnalytics, getCompany, getInsights, getNews } from "../api/marketApi";
import ChatPanel from "../components/ChatPanel";
import LoadingState from "../components/LoadingState";
import NewsList from "../components/NewsList";
import SearchBar from "../components/SearchBar";

const DONUT_COLORS = ["#ff6a00", "#ff8c33", "#ffab66", "#ffc58f", "#ffe1bf"];

function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  if (Math.abs(value) >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function toPercent(value) {
  if (value === null || value === undefined) return "N/A";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function toPercentAlready(value) {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(2)}%`;
}

function parseBusinessModelTags(company, insights) {
  const fromBackend = company.business_tags || [];
  if (fromBackend.length > 0) return fromBackend.slice(0, 6);

  const source = `${insights.business_model || ""} ${company.overview.industry || ""}`.toLowerCase();
  const map = [
    ["it", "IT Services"],
    ["consult", "Consulting"],
    ["cloud", "Cloud Solutions"],
    ["ai", "AI & Automation"],
    ["digital", "Digital Platforms"],
    ["retail", "Retail Solutions"],
    ["bank", "BFSI Solutions"],
  ];
  const tags = map.filter(([key]) => source.includes(key)).map(([, label]) => label);
  return tags.length > 0 ? tags.slice(0, 6) : [company.overview.industry || company.overview.sector || "Core Business"];
}

function strengthBadges(analytics, insights) {
  const badges = [];
  const growthText = (insights.growth || []).join(" ").toLowerCase();
  if (analytics.trend === "Bullish") badges.push("Positive Momentum");
  if ((analytics.performance?.one_year || 0) > 0) badges.push("Consistent Returns");
  if ((analytics.volatility || 100) < 30) badges.push("Stable Volatility");
  if (growthText.includes("revenue")) badges.push("Revenue Visibility");
  if (growthText.includes("scale")) badges.push("Scalable Model");
  if (growthText.includes("catalyst")) badges.push("Near-Term Catalysts");
  if (badges.length === 0) badges.push("Market Resilience");
  return badges.slice(0, 5);
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

  const kpiCards = useMemo(() => {
    if (!company) return [];
    return [
      { label: "Market Cap", value: formatValue(company.overview.market_cap), icon: Landmark },
      { label: "Revenue (TTM)", value: formatValue(company.key_stats.revenue), icon: IndianRupee },
      { label: "Net Profit", value: formatValue(company.key_stats.net_profit), icon: LineChart },
      { label: "Employees", value: formatValue(company.key_stats.employees), icon: UsersRound },
      { label: "P/E Ratio", value: formatValue(company.key_stats.trailing_pe), icon: BriefcaseBusiness },
    ];
  }, [company]);

  const trendSeries = useMemo(() => company?.financial_trends || [], [company]);
  const segmentSeries = useMemo(() => company?.segment_distribution || [], [company]);
  const businessTags = useMemo(() => (company && insights ? parseBusinessModelTags(company, insights) : []), [company, insights]);
  const badges = useMemo(() => (analytics && insights ? strengthBadges(analytics, insights) : []), [analytics, insights]);

  const performanceBars = useMemo(() => {
    if (!analytics) return [];
    return [
      { period: "1M", value: analytics.performance?.one_month || 0 },
      { period: "3M", value: analytics.performance?.three_month || 0 },
      { period: "1Y", value: analytics.performance?.one_year || 0 },
    ];
  }, [analytics]);

  const latestPrice = company?.chart_data?.[company.chart_data.length - 1]?.close ?? null;
  const companyLogo = company?.overview?.website
    ? `https://www.google.com/s2/favicons?domain_url=${company.overview.website}&sz=128`
    : null;

  return (
    <div className="dashboard-page">
      <section className="search-zone glass-card">
        <SearchBar onSearch={(nextSymbol) => navigate(`/company/${nextSymbol}`)} initialValue="" />
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
          <section className="company-top-card glass-card">
            <div className="identity-stack">
              <div className="logo-holder">
                {companyLogo ? <img src={companyLogo} alt={company.overview.name} /> : <Building2 size={20} />}
              </div>
              <div>
                <h2>{company.overview.name}</h2>
                <p>{company.overview.exchange_symbol}</p>
              </div>
            </div>
            <div className="meta-chip-row">
              <span>{company.overview.sector || "Sector N/A"}</span>
              <span>{company.overview.industry || "Industry N/A"}</span>
              <span>{company.overview.hq_location || "HQ N/A"}</span>
              <span>{company.overview.founded_year || "Founded N/A"}</span>
            </div>
            <div className="top-card-price">
              <p>Current Price</p>
              <h3>{latestPrice ? `Rs ${formatValue(latestPrice)}` : "N/A"}</h3>
            </div>
          </section>

          <section className="kpi-grid">
            {kpiCards.map((item) => (
              <article className="kpi-card glass-card" key={item.label}>
                <div className="kpi-title">
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </div>
                <h3>{item.value}</h3>
              </article>
            ))}
          </section>

          <section className="chart-grid">
            <article className="chart-card glass-card">
              <div className="section-head">
                <h3>Revenue Trend</h3>
                <p>Annual progression</p>
              </div>
              <div className="chart-slot">
                <ResponsiveContainer width="100%" height={220}>
                  <ReLineChart data={trendSeries}>
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => formatValue(value)} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ff6a00"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="chart-card glass-card">
              <div className="section-head">
                <h3>Profit Trend</h3>
                <p>Net income trajectory</p>
              </div>
              <div className="chart-slot">
                <ResponsiveContainer width="100%" height={220}>
                  <ReLineChart data={trendSeries}>
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => formatValue(value)} />
                    <Line
                      type="monotone"
                      dataKey="net_income"
                      stroke="#ff9f4d"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="chart-grid">
            <article className="chart-card glass-card">
              <div className="section-head">
                <h3>Segment Distribution</h3>
                <p>Business mix snapshot</p>
              </div>
              <div className="donut-layout">
                <div className="chart-slot">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={segmentSeries}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        isAnimationActive
                      >
                        {segmentSeries.map((segment, index) => (
                          <Cell key={segment.label} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="legend-stack">
                  {segmentSeries.map((segment, index) => (
                    <div key={segment.label} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                      <span>{segment.label}</span>
                      <strong>{Number(segment.value).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="chart-card glass-card">
              <div className="section-head">
                <h3>Performance Bars</h3>
                <p>Returns across windows</p>
              </div>
              <div className="chart-slot">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={performanceBars}>
                    <XAxis dataKey="period" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => toPercentAlready(value)} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#ff7d1a" isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="info-grid">
            <article className="glass-card tags-card">
              <div className="section-head">
                <h3>Business Model</h3>
                <p>Core operating themes</p>
              </div>
              <div className="chip-wrap">
                {businessTags.map((tag) => (
                  <button key={tag} type="button" className="soft-chip">
                    {tag}
                  </button>
                ))}
              </div>
            </article>

            <article className="glass-card badges-card">
              <div className="section-head">
                <h3>Key Strengths</h3>
                <p>Quality indicators</p>
              </div>
              <div className="chip-wrap">
                {badges.map((badge) => (
                  <span key={badge} className="strength-badge">
                    {badge}
                  </span>
                ))}
              </div>
            </article>
          </section>

          <section className="ai-insight-card glass-card">
            <div className="section-head">
              <h3>AI Insight</h3>
              <p>Condensed intelligence</p>
            </div>
            <p>{insights.summary}</p>
            <div className="insight-metrics">
              <span>Trend: {analytics.trend}</span>
              <span>Volatility: {toPercentAlready(analytics.volatility)}</span>
              <span>ROE: {toPercent(company.key_stats.roe)}</span>
              <span>
                <Clock3 size={14} /> Updated in real-time
              </span>
              <span>
                <Globe2 size={14} /> {company.overview.hq_location || "Global operations"}
              </span>
            </div>
          </section>

          <NewsList items={news} />
          <ChatPanel symbol={symbol} />
        </>
      )}
    </div>
  );
}

export default CompanyPage;
