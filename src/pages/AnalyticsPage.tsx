import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getQueryLogs } from "@/lib/supabase-helpers";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area,
} from "recharts";
import { TrendingUp, BarChart3, AlertTriangle, Clock } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeData, setTimeData] = useState<any[]>([]);
  const [freqData, setFreqData] = useState<any[]>([]);
  const [slowQueries, setSlowQueries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    getQueryLogs(user.id).then((logs) => {
      setTimeData(logs.slice(0, 30).reverse().map((l, i) => ({ query: `Q${i + 1}`, time: Number(l.execution_time_ms || 0) })));
      const freqMap: Record<string, number> = {};
      logs.forEach(l => { const d = new Date(l.created_at).toLocaleDateString(); freqMap[d] = (freqMap[d] || 0) + 1; });
      setFreqData(Object.entries(freqMap).slice(0, 14).reverse().map(([date, count]) => ({ date, count })));
      setSlowQueries(logs.filter(l => Number(l.execution_time_ms || 0) > 50).slice(0, 10).map((l, i) => ({ query: `S${i + 1}`, time: Number(l.execution_time_ms || 0) })));
    });
  }, [user]);

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
        <p className="text-white/40 mt-1">Visualize query performance trends and insights</p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: TrendingUp, label: "Total Tracked", value: timeData.length, color: "from-orange-500 to-amber-500" },
          { icon: Clock, label: "Avg Time", value: timeData.length ? `${(timeData.reduce((s, t) => s + t.time, 0) / timeData.length).toFixed(1)}ms` : "—", color: "from-blue-500 to-indigo-500" },
          { icon: BarChart3, label: "Days Tracked", value: freqData.length, color: "from-emerald-500 to-teal-500" },
          { icon: AlertTriangle, label: "Slow Queries", value: slowQueries.length, color: "from-red-500 to-pink-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4">Execution Time Trend</h3>
          {timeData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-white/30 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="query" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                <Area type="monotone" dataKey="time" stroke="#f97316" fill="rgba(249,115,22,0.15)" strokeWidth={2} name="Time (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4">Query Frequency</h3>
          {freqData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-white/30 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={freqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                <Bar dataKey="count" fill="rgba(249,115,22,0.6)" radius={[6, 6, 0, 0]} name="Queries" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/[0.06] p-6 lg:col-span-2 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4">Slow Queries (&gt;50ms)</h3>
          {slowQueries.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-white/30 text-sm">No slow queries detected</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={slowQueries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="query" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                <Line type="monotone" dataKey="time" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} name="Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
