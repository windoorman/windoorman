import "./assets/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useMatch,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import WindowPage from "./pages/WindowPage/WindowPage";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import InfoPage from "./pages/InfoPage/InfoPage";
import LoginPage from "./pages/LoginPage/LoginPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/window" element={<WindowPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/info" element={<InfoPage />} />
      </Routes>
      <Navbar />
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
