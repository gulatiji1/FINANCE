import { Navigate, Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import ComparePage from "./pages/ComparePage";
import CompanyPage from "./pages/CompanyPage";
import HomePage from "./pages/HomePage";
import MarketsPage from "./pages/MarketsPage";

function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/company/:symbol" element={<CompanyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
