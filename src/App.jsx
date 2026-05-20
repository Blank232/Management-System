import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Calendar as CalendarIcon, PieChart, LogOut } from "lucide-react";
import { AppProvider, useAppContext } from "./context/AppContext";

import CalendarView from "./pages/CalendarView.jsx";
import DailyView from "./pages/DailyView.jsx";
import ExpenseManager from "./pages/ExpenseManager.jsx";
import Login from "./pages/Login.jsx";

const BottomNav = () => {
  const location = useLocation();
  const { logout } = useAppContext();
  // Don't show bottom nav on the daily view, we want that to be full screen
  if (location.pathname.startsWith("/day/")) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-4 md:pb-3">
      <Link
        to="/"
        className={`flex flex-col items-center transition-colors ${location.pathname === "/" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
      >
        <CalendarIcon size={24} />
        <span className="text-xs mt-1">Calendar</span>
      </Link>
      <Link
        to="/expenses"
        className={`flex flex-col items-center transition-colors ${location.pathname === "/expenses" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
      >
        <PieChart size={24} />
        <span className="text-xs mt-1">Expenses</span>
      </Link>
      <button
        onClick={logout}
        className="flex flex-col items-center transition-colors text-slate-500 hover:text-rose-400"
      >
        <LogOut size={24} />
        <span className="text-xs mt-1">Logout</span>
      </button>
    </div>
  );
};

const MainRoutes = () => {
  const { user, loadingAuth } = useAppContext();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold text-lg animate-pulse">
        Loading...
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-950 pb-16 font-sans text-slate-100">
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/day/:date" element={<DailyView />} />
        <Route path="/expenses" element={<ExpenseManager />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
