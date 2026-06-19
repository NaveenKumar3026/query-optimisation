import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { DollarSign, Loader2, Sparkles, Activity, Server, Cpu } from "lucide-react";

export default function CostEstimationPage() {
  const [sql, setSQL] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("analyze", { sql: `EXPLAIN ANALYZE context for: ${sql}` });
      const cleaned = data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(cleaned); } catch { parsed = { rating: "fair", analysis: data.result }; }
      setResult(parsed);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const isOptimized = result?.rating === "excellent" || result?.rating === "good";

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Cost Estimation</h1>
        <p className="text-white/40 mt-1">Analyze query cost and resource usage</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste Oracle SQL to estimate cost..." className="min-h-[160px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
          <Button onClick={estimate} disabled={loading} className="mt-4 w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Estimate Cost
          </Button>
        </div>

        <div className="space-y-4">
          {[
            { icon: Activity, label: "Cost Level", value: result ? (isOptimized ? "🟢 Optimized" : "🔴 Expensive") : "—" },
            { icon: Server, label: "Rows Scanned", value: result ? "Estimated by AI" : "—" },
            { icon: Cpu, label: "Index Usage", value: result?.rating ? result.rating : "—" },
          ].map((m, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <m.icon className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-xs text-white/40">{m.label}</p>
                  <p className="font-semibold text-white capitalize">{m.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="relative mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-scale-in">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-5 h-5 rounded-full ${isOptimized ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"}`} />
              <span className={`font-bold text-xl ${isOptimized ? "text-emerald-300" : "text-red-300"}`}>
                {isOptimized ? "Optimized Query" : "Expensive Query"}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{result.analysis}</p>
          </div>
          {result.recommendations?.length > 0 && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
              <h4 className="font-semibold text-white mb-3">Recommendations</h4>
              <ul className="text-sm text-white/50 space-y-2 list-disc list-inside">
                {result.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
