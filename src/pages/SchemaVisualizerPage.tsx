import DashboardLayout from "@/components/DashboardLayout";
import { Database, ArrowRight, Key, Hash } from "lucide-react";

const tables = [
  {
    name: "query_logs",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "natural_language_input", type: "text" },
      { name: "generated_sql", type: "text" },
      { name: "execution_time_ms", type: "numeric" },
      { name: "rows_returned", type: "int" },
      { name: "status", type: "varchar2" },
      { name: "created_at", type: "timestamp" },
    ],
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "query_analysis",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "query_log_id", type: "uuid", fk: true },
      { name: "analysis_text", type: "text" },
      { name: "performance_rating", type: "varchar2" },
      { name: "issues_detected", type: "jsonb" },
      { name: "recommendations", type: "jsonb" },
      { name: "created_at", type: "timestamp" },
    ],
    color: "from-purple-500 to-violet-600",
  },
  {
    name: "optimization_suggestions",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "query_log_id", type: "uuid", fk: true },
      { name: "suggestion_type", type: "varchar2" },
      { name: "suggestion_text", type: "text" },
      { name: "suggested_sql", type: "text" },
      { name: "status", type: "varchar2" },
      { name: "applied_at", type: "timestamp" },
      { name: "created_at", type: "timestamp" },
    ],
    color: "from-emerald-500 to-teal-600",
  },
];

const relationships = [
  { from: "query_analysis", fromCol: "query_log_id", to: "query_logs", toCol: "id" },
  { from: "optimization_suggestions", fromCol: "query_log_id", to: "query_logs", toCol: "id" },
];

export default function SchemaVisualizerPage() {
  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Schema Visualizer</h1>
        <p className="text-white/40 mt-1">Interactive database schema with tables and relationships</p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tables.map((table, ti) => (
          <div key={table.name} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden animate-slide-up hover:border-white/[0.12] transition-all" style={{ animationDelay: `${ti * 100}ms` }}>
            <div className={`bg-gradient-to-r ${table.color} px-5 py-3 flex items-center gap-2`}>
              <Database className="w-4 h-4 text-white" />
              <h3 className="font-bold text-white text-sm">{table.name}</h3>
            </div>
            <div className="p-4 space-y-1">
              {table.columns.map((col, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-white/[0.04] transition-colors">
                  {col.pk ? <Key className="w-3 h-3 text-amber-400" /> : col.fk ? <ArrowRight className="w-3 h-3 text-indigo-400" /> : <Hash className="w-3 h-3 text-white/20" />}
                  <span className="font-mono text-white/80 flex-1">{col.name}</span>
                  <span className="text-white/30 text-[10px] uppercase">{col.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
        <h3 className="font-semibold text-white mb-4">Relationships</h3>
        <div className="space-y-3">
          {relationships.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
              <div className="px-3 py-1.5 bg-white/[0.06] rounded-md text-xs font-mono text-white">
                {r.from}.<span className="text-indigo-400">{r.fromCol}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40" />
              <div className="px-3 py-1.5 bg-white/[0.06] rounded-md text-xs font-mono text-white">
                {r.to}.<span className="text-amber-400">{r.toCol}</span>
              </div>
              <span className="text-xs text-white/30 ml-auto">Foreign Key</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-4 mt-6">
        {[
          { label: "Tables", value: tables.length },
          { label: "Total Columns", value: tables.reduce((s, t) => s + t.columns.length, 0) },
          { label: "Relationships", value: relationships.length },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
