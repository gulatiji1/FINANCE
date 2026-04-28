import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMarketOverview } from "../api/marketApi";
import LoadingState from "../components/LoadingState";

const LINE_COLORS = ["#ff6a00", "#f57f4f", "#d95d00", "#ffb180"];

function formatCompact(value) {
  if (value === null || value === undefined) return "N/A";
  if (Math.abs(value) >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function ComparePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    async function loadRows() {
      setLoading(true);
      setError("");
      try {
        const payload = await getMarketOverview(20);
        setRows(payload.rows || []);
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load comparison page.");
      } finally {
        setLoading(false);
      }
    }
    loadRows();
  }, []);

  const applySymbols = (event) => {
    event.preventDefault();
    const symbols = input
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 4);
    const matches = rows.filter((row) => symbols.some((symbol) => row.symbol.includes(symbol)));
    setSelected(matches);
  };

  const chartData = useMemo(() => {
    if (selected.length === 0) return [];
    const allDates = Array.from(
      new Set(selected.flatMap((stock) => (stock.history || []).map((point) => point.date)))
    ).sort();

    return allDates.map((date) => {
      const record = { date };
      selected.forEach((stock) => {
        const point = (stock.history || []).find((entry) => entry.date === date);
        record[stock.symbol] = point ? point.close : null;
      });
      return record;
    });
  }, [selected]);

  return (
    <div className="page-wrap">
      <section className="glass-card">
        <div className="section-head">
          <h3>Compare Stocks</h3>
          <p>Enter up to 4 symbols, comma separated</p>
        </div>
        <form className="compare-form" onSubmit={applySymbols}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: TCS, INFY, RELIANCE"
          />
          <button type="submit">Apply</button>
        </form>
      </section>

      {loading && <LoadingState label="Loading comparison data..." />}
      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <>
          <section className="glass-card">
            <div className="table-wrap">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>P/E Ratio</th>
                    <th>Market Cap</th>
                    <th>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.length > 0 ? selected : rows.slice(0, 6)).map((row) => (
                    <tr key={row.symbol}>
                      <td>{row.symbol}</td>
                      <td>Rs {formatCompact(row.price)}</td>
                      <td>{formatCompact(row.pe_ratio)}</td>
                      <td>{formatCompact(row.market_cap)}</td>
                      <td className={row.change_percent >= 0 ? "up" : "down"}>
                        {row.change_percent === null || row.change_percent === undefined
                          ? "N/A"
                          : `${row.change_percent.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-card">
            <div className="section-head">
              <h3>Price Trend Comparison</h3>
              <p>Relative movement across selected stocks</p>
            </div>
            <div className="chart-slot">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => `Rs ${formatCompact(value)}`} />
                  {(selected.length > 0 ? selected : rows.slice(0, 3)).map((row, index) => (
                    <Line
                      key={row.symbol}
                      type="monotone"
                      dataKey={row.symbol}
                      stroke={LINE_COLORS[index % LINE_COLORS.length]}
                      strokeWidth={2.3}
                      dot={false}
                      isAnimationActive
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ComparePage;

