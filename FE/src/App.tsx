import "./assets/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
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

function App() {
  const location = useLocation();

  const hideNavbar = ["/", "/token"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/window" element={<WindowPage />} />
        <Route path="/home" element={<HomeList />} />
        <Route path="/home/regist" element={<HomeRegist />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/token" element={<KakaRedirect />} />
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
