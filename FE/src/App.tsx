import "./assets/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import WindowPage from "./pages/WindowPage/WindowPage";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import InfoPage from "./pages/InfoPage/InfoPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import KakaRedirect from "./pages/LoginPage/KakaoRedirect";
import HomeList from "./components/home/HomeList";
import HomeRegist from "./components/home/HomeRegist";
import HomeUpdate from "./components/home/HomeUpdate";
import ProtectedRoute from "./pages/ProtectedRoute";
import ReportPage from "./components/info/ReportPage";
import MonitoringMain from "./components/monitoring/MonitoringMain";

function App() {
  const location = useLocation();
  const hideNavbar = ["/", "/token", "/login"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/token" element={<KakaRedirect />} />

        {/* 보호된 경로 */}
        <Route
          path="/window"
          element={
            <ProtectedRoute>
              <WindowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/regist"
          element={
            <ProtectedRoute>
              <HomeRegist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/update"
          element={
            <ProtectedRoute>
              <HomeUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/info"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/monitoring"
          element={
            <ProtectedRoute>
              <MonitoringMain />
            </ProtectedRoute>
          }
        />

        {/* 기본 경로 */}

        {/* 유효하지 않은 경로일 경우 /window로 리디렉션 */}
        <Route path="*" element={<Navigate to="/window" replace />} />
      </Routes>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
