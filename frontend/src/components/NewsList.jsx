function NewsList({ items }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Latest News</h3>
        <p>Relevant headlines for context-aware analysis</p>
      </div>
      <div className="news-list">
        {items.length === 0 && <p className="muted">No recent headlines available.</p>}
        {items.map((item) => (
          <a href={item.url} target="_blank" rel="noreferrer" className="news-item" key={item.url}>
            <h4>{item.title}</h4>
            <p>{item.description || "No description provided."}</p>
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

