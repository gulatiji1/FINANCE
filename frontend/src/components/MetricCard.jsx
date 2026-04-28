function formatNumber(value) {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string") return value;
  if (Math.abs(value) >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function MetricCard({ label, value, isPercent = false }) {
  const output = value === null || value === undefined ? "N/A" : isPercent ? `${(value * 100).toFixed(2)}%` : formatNumber(value);

  return (
    <article className="metric-card">
      <p>{label}</p>
      <h4>{output}</h4>
    </article>
  );
}

export default MetricCard;
