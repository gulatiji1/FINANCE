import { useState } from "react";
import { compareCompanies } from "../api/marketApi";
import ComparisonTable from "../components/ComparisonTable";
import LoadingState from "../components/LoadingState";

function ComparePage() {
  const [symbol1, setSymbol1] = useState("TCS");
  const [symbol2, setSymbol2] = useState("INFY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await compareCompanies(symbol1.trim().toUpperCase(), symbol2.trim().toUpperCase());
      setComparison(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to compare these symbols.");
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page compare-page">
      <section className="panel">
        <div className="panel-header">
          <h3>Compare Two Companies</h3>
          <p>Revenue, margins, ROE, stock performance, market cap, and AI summary</p>
        </div>
        <form className="compare-form" onSubmit={handleSubmit}>
          <input value={symbol1} onChange={(event) => setSymbol1(event.target.value)} placeholder="First symbol" />
          <input value={symbol2} onChange={(event) => setSymbol2(event.target.value)} placeholder="Second symbol" />
          <button type="submit">Compare</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      {loading && <LoadingState label="Comparing companies..." />}
      {!loading && comparison && <ComparisonTable data={comparison} />}
    </div>
  );
}

export default ComparePage;

