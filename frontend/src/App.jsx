import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ComparePage from "./pages/ComparePage";
import CompanyPage from "./pages/CompanyPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/company/:symbol" element={<CompanyPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

