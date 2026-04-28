import { Navigate, Route, Routes } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTopBar from "./components/DashboardTopBar";
import MobileBottomNav from "./components/MobileBottomNav";
import ComparePage from "./pages/ComparePage";
import CompanyPage from "./pages/CompanyPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/company/:symbol" element={<CompanyPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default App;
