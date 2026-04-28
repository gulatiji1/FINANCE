function NewsList({ items }) {
  return (
    <section className="glass-card">
      <div className="section-head">
        <h3>Latest News</h3>
        <p>Context signals for AI analysis</p>
      </div>
      <div className="news-list">
        {items.length === 0 && <p className="muted">No recent headlines available.</p>}
        {items.map((item) => (
          <a href={item.url} target="_blank" rel="noreferrer" className="news-item" key={item.url}>
            <h4>{item.title}</h4>
            <span>
              {item.source} | {item.published_at?.slice(0, 10) || "N/A"}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default NewsList;
