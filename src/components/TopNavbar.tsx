import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Search, ClipboardList, Database, BarChart3,
  LogOut, Sparkles, Mic, Gauge, DollarSign, BookOpen, Download,
  Menu, X, Home, Layers, GitBranch, MicOff,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Query", icon: Search, path: "/query" },
  { label: "Logs", icon: ClipboardList, path: "/logs" },
  { label: "Records", icon: Database, path: "/records" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Voice SQL", icon: Mic, path: "/voice-to-sql" },
  { label: "Score", icon: Gauge, path: "/optimization-score" },
  { label: "Cost", icon: DollarSign, path: "/cost-estimation" },
  { label: "Explain", icon: BookOpen, path: "/query-explanation" },
  { label: "Export", icon: Download, path: "/export-results" },
  { label: "Schema", icon: Layers, path: "/schema-visualizer" },
  { label: "ER Text", icon: GitBranch, path: "/er-diagram-text" },
  { label: "ER Voice", icon: MicOff, path: "/er-diagram-voice" },
];

export default function TopNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#0f172a]/80 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between h-14">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0 animate-logo-reveal">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white hidden sm:block">QueryAI</span>
        </button>

        <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200 group ${
                  isActive
                    ? "text-indigo-400"
                    : "text-white/50 hover:text-white/90"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full transition-all duration-300 ${
                  isActive ? "w-3/4" : "w-0 group-hover:w-1/2"
                }`} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-white/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden backdrop-blur-2xl bg-[#0f172a]/95 border-b border-white/[0.06] animate-slide-up">
          <div className="grid grid-cols-3 gap-1 p-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all ${
                    isActive ? "bg-indigo-500/20 text-indigo-400" : "text-white/50 hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={async () => { await signOut(); navigate("/"); setMobileOpen(false); }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
