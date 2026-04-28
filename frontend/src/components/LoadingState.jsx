function LoadingState({ label = "Loading..." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingState;

