function metricLabelMap() {
  return [
    { key: "market_cap", label: "Market Cap" },
    { key: "revenue", label: "Revenue" },
    { key: "profit_margin", label: "Profit Margin" },
    { key: "roe", label: "ROE" },
    { key: "one_year_return", label: "1Y Return" },
  ];
}

function formatMetricValue(key, value) {
  if (value === null || value === undefined) return "N/A";
  if (key === "profit_margin" || key === "roe" || key === "one_year_return") return `${(value * (key === "one_year_return" ? 1 : 100)).toFixed(2)}%`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function ComparisonTable({ data }) {
  const rows = metricLabelMap();
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Comparison</h3>
        <p>Side-by-side financial snapshot</p>
      </div>
      <div className="comparison-grid">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>{data.left.name}</th>
              <th>{data.right.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{formatMetricValue(row.key, data.left[row.key])}</td>
                <td>{formatMetricValue(row.key, data.right[row.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="insight-grid">
        <article className="insight-card">
          <h4>Summary</h4>
          <p>{data.ai.summary}</p>
        </article>
        <article className="insight-card">
          <h4>Key Differences</h4>
          <ul>
            {(data.ai.key_differences || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="insight-card">
          <h4>Strengths</h4>
          <ul>
            {(data.ai.strengths || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="insight-card">
          <h4>Weaknesses</h4>
          <ul>
            {(data.ai.weaknesses || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default ComparisonTable;
