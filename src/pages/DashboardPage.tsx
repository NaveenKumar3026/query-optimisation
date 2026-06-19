import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getQueryLogs, getOptimizationSuggestions } from "@/lib/supabase-helpers";
import { useNavigate } from "react-router-dom";
import { Search, ClipboardList, Zap, Clock, ArrowRight, Mic, Gauge, BarChart3, Database, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalQueries: 0, avgTime: 0, suggestions: 0, errors: 0 });

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const logs = await getQueryLogs(user!.id);
        const suggestions = await getOptimizationSuggestions(user!.id);
        const avgTime = logs.length > 0 ? logs.reduce((s, l) => s + Number(l.execution_time_ms || 0), 0) / logs.length : 0;
        const errors = logs.filter((l) => l.status === "error").length;
        setStats({ totalQueries: logs.length, avgTime: Math.round(avgTime * 100) / 100, suggestions: suggestions.length, errors });
      } catch (e) { console.error(e); }
    }
    load();
  }, [user]);

  const statCards = [
    { title: "Total Queries", value: stats.totalQueries, icon: <Search className="w-5 h-5" />, color: "from-indigo-500 to-blue-600" },
    { title: "Avg Execution Time", value: `${stats.avgTime}ms`, icon: <Clock className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
    { title: "Optimizations", value: stats.suggestions, icon: <Zap className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
    { title: "Errors", value: stats.errors, icon: <ClipboardList className="w-5 h-5" />, color: "from-red-500 to-pink-600" },
  ];

  const quickLinks = [
    { label: "Voice to SQL", icon: Mic, path: "/voice-to-sql", color: "from-cyan-500 to-blue-600" },
    { label: "Optimization Score", icon: Gauge, path: "/optimization-score", color: "from-emerald-500 to-teal-600" },
    { label: "Analytics", icon: BarChart3, path: "/analytics", color: "from-orange-500 to-red-500" },
    { label: "ER Diagrams", icon: GitBranch, path: "/er-diagram-text", color: "from-purple-500 to-indigo-600" },
  ];

  return (
    <DashboardLayout className="bg-[#0b1120] min-h-screen">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">AI Database Control Center</h1>
        <p className="text-white/40 mt-1">Overview of your database activity and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3 shadow-lg`}>{s.icon}</div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-white/40 mt-1">{s.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {quickLinks.map((q, i) => (
          <button key={i} onClick={() => navigate(q.path)} className={`bg-gradient-to-br ${q.color} rounded-xl p-5 text-left hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
            <q.icon className="w-7 h-7 text-white mb-3" />
            <h3 className="font-bold text-white">{q.label}</h3>
            <p className="text-white/60 text-xs mt-1">Click to explore →</p>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white/[0.04] backdrop-blur-xl rounded-xl p-6 border border-white/[0.06] animate-slide-up">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Write a query", desc: "Type your question in natural language" },
            { step: "2", title: "AI converts to Oracle SQL", desc: "Our AI generates optimized Oracle SQL" },
            { step: "3", title: "Get insights", desc: "View analysis and optimization suggestions" },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold mb-3">{item.step}</div>
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-sm text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
        <Button onClick={() => navigate("/query")} className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          Execute Intelligent Query <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </DashboardLayout>
  );
}
