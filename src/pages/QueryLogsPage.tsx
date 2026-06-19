import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getQueryLogs } from "@/lib/supabase-helpers";
import { ClipboardList, Search } from "lucide-react";

export default function QueryLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    getQueryLogs(user.id).then((data) => { setLogs(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const filtered = logs.filter(l =>
    !filter || l.generated_sql?.toLowerCase().includes(filter.toLowerCase()) ||
    l.natural_language_input?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <DashboardLayout className="bg-[#0b1120] min-h-screen">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Query Logs</h1>
        <p className="text-white/40 mt-1">Complete history of all executed queries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Queries", value: logs.length, color: "from-indigo-500 to-blue-600" },
          { label: "Successful", value: logs.filter(l => l.status === "success").length, color: "from-emerald-500 to-teal-600" },
          { label: "Failed", value: logs.filter(l => l.status === "error").length, color: "from-red-500 to-pink-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search queries..." className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50" />
      </div>

      <div className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/[0.06] overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-8 text-center text-white/30">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/30 flex flex-col items-center">
            <ClipboardList className="w-12 h-12 mb-3 text-white/10" />
            <p>No queries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-4 font-medium text-white/50">SQL</th>
                  <th className="text-left p-4 font-medium text-white/50">NL Input</th>
                  <th className="text-left p-4 font-medium text-white/50">Time (ms)</th>
                  <th className="text-left p-4 font-medium text-white/50">Rows</th>
                  <th className="text-left p-4 font-medium text-white/50">Status</th>
                  <th className="text-left p-4 font-medium text-white/50">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-mono text-xs text-white/60 max-w-[300px] truncate">{log.generated_sql}</td>
                    <td className="p-4 text-white/40 max-w-[200px] truncate">{log.natural_language_input || "—"}</td>
                    <td className="p-4 text-white/50">{Number(log.execution_time_ms || 0).toFixed(2)}</td>
                    <td className="p-4 text-white/50">{log.rows_returned}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{log.status}</span>
                    </td>
                    <td className="p-4 text-white/30 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
