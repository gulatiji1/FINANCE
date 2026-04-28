import { useEffect, useMemo, useState } from "react";
import { getMarketOverview } from "../api/marketApi";
import LoadingState from "../components/LoadingState";

function formatCompact(value) {
  if (value === null || value === undefined) return "N/A";
  if (Math.abs(value) >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function MarketsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sector, setSector] = useState("All");
  const [priceBand, setPriceBand] = useState("All");

  useEffect(() => {
    async function loadRows() {
      setLoading(true);
      setError("");
      try {
        const payload = await getMarketOverview(20);
        setRows(payload.rows || []);
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load market page.");
      } finally {
        setLoading(false);
      }
    }
    loadRows();
  }, []);

  const sectors = useMemo(() => {
    const values = Array.from(new Set(rows.map((row) => row.sector).filter(Boolean)));
    return ["All", ...values];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const sectorOk = sector === "All" || row.sector === sector;
      let priceOk = true;
      if (priceBand === "Under500") priceOk = (row.price || 0) < 500;
      if (priceBand === "500to2000") priceOk = (row.price || 0) >= 500 && (row.price || 0) <= 2000;
      if (priceBand === "Above2000") priceOk = (row.price || 0) > 2000;
      return sectorOk && priceOk;
    });
  }, [rows, sector, priceBand]);

  return (
    <div className="page-wrap">
      <section className="glass-card market-filter-row">
        <div>
          <h3>Market Overview</h3>
          <p className="muted">Filter and scan broader listings</p>
        </div>
        <div className="filters-inline">
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            {sectors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={priceBand} onChange={(event) => setPriceBand(event.target.value)}>
            <option value="All">All Prices</option>
            <option value="Under500">Under 500</option>
            <option value="500to2000">500 to 2000</option>
            <option value="Above2000">Above 2000</option>
          </select>
        </div>
      </section>

      {loading && <LoadingState label="Loading markets..." />}
      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <section className="glass-card">
          <div className="table-wrap">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Ticker</th>
                  <th>Sector</th>
                  <th>Price</th>
                  <th>% Change</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.symbol}>
                    <td>{row.name}</td>
                    <td>{row.symbol}</td>
                    <td>{row.sector || "N/A"}</td>
                    <td>Rs {formatCompact(row.price)}</td>
                    <td className={row.change_percent >= 0 ? "up" : "down"}>
                      {row.change_percent === null || row.change_percent === undefined
                        ? "N/A"
                        : `${row.change_percent.toFixed(2)}%`}
                    </td>
                    <td>{formatCompact(row.market_cap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default MarketsPage;

