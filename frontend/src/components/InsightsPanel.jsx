function InsightsPanel({ insights }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>AI Insights</h3>
        <p>Generated with Gemini + market context</p>
      </div>
      <div className="insight-grid">
        <article className="insight-card">
          <h4>Business Summary</h4>
          <p>{insights.summary || "N/A"}</p>
        </article>
        <article className="insight-card">
          <h4>Business Model</h4>
          <p>{insights.business_model || "N/A"}</p>
        </article>
        <article className="insight-card">
          <h4>Growth Drivers</h4>
          <ul>
            {(insights.growth || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="insight-card">
          <h4>Risk Factors</h4>
          <ul>
            {(insights.risks || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </div>
      <article className="insight-callout">
        <h4>Investment Insight</h4>
        <p>{insights.insight || "N/A"}</p>
      </article>
    </section>
  );
}

export default InsightsPanel;

