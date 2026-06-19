import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Database, Table, Columns } from "lucide-react";

type TableName = "query_logs" | "query_analysis" | "optimization_suggestions";

const availableTables: { name: TableName; label: string }[] = [
  { name: "query_logs", label: "Query Logs" },
  { name: "query_analysis", label: "Query Analysis" },
  { name: "optimization_suggestions", label: "Optimization Suggestions" },
];

export default function DatabaseRecordsPage() {
  const [selectedTable, setSelectedTable] = useState<TableName>("query_logs");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    supabase.from(selectedTable).select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (error) { setRecords([]); setColumns([]); }
        else { setRecords(data || []); setColumns(data?.length ? Object.keys(data[0]) : []); }
        setLoading(false);
      });
  }, [selectedTable]);

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Database Records</h1>
        <p className="text-white/40 mt-1">Browse and explore your database tables</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Table, label: "Tables", value: availableTables.length },
          { icon: Columns, label: "Current Table", value: selectedTable.replace(/_/g, " ") },
          { icon: Database, label: "Records", value: records.length },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-teal-400" />
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
            <p className="text-xl font-bold text-white capitalize">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {availableTables.map((t) => (
          <button key={t.name} onClick={() => setSelectedTable(t.name)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            selectedTable === t.name ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg" : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] border border-white/[0.06]"
          }`}>
            <Database className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/[0.06] overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-8 text-center text-white/30">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-white/30 flex flex-col items-center">
            <Database className="w-12 h-12 mb-3 text-white/10" />
            <p>No records in this table</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {columns.map((col) => (
                    <th key={col} className="text-left p-3 font-medium text-white/50 text-xs uppercase tracking-wide">{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    {columns.map((col) => (
                      <td key={col} className="p-3 text-xs text-white/50 max-w-[200px] truncate">
                        {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "—")}
                      </td>
                    ))}
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
