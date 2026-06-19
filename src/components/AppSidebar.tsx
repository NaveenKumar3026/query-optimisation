import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  Database,
  BarChart3,
  LogOut,
  Sparkles,
  Brain,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Query & Optimize", icon: Search, path: "/query" },
  { label: "Query Logs", icon: ClipboardList, path: "/logs" },
  { label: "Database Records", icon: Database, path: "/records" },
  { label: "Performance", icon: BarChart3, path: "/analytics" },
  { label: "AI Insights", icon: Brain, path: "/ai-insights" },
];

export default function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen gradient-sidebar border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 animate-logo-reveal">
          <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">QueryAI</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
