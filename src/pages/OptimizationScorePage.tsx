import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Loader2, Sparkles, TrendingUp, Clock, Layers } from "lucide-react";

export default function OptimizationScorePage() {
  const [sql, setSQL] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("analyze", { sql });
      const cleaned = data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(cleaned); } catch { parsed = { rating: "fair" }; }
      const scoreMap: Record<string, number> = { excellent: 95, good: 78, fair: 55, poor: 25 };
      setScore(scoreMap[parsed.rating] || 50);
      setDetails(parsed);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const scoreColor = score !== null
    ? score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"
    : "";

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Optimization Score</h1>
        <p className="text-white/40 mt-1">Measure your query efficiency instantly</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste your Oracle SQL query here..." className="min-h-[160px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25" />
          <Button onClick={analyze} disabled={loading} className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Analyze Score
          </Button>
        </div>

        <div className="space-y-4">
          {[
            { icon: TrendingUp, label: "Execution", value: details?.rating || "—" },
            { icon: Clock, label: "Complexity", value: details?.issues?.length ? `${details.issues.length} issues` : "Clean" },
            { icon: Layers, label: "Index Usage", value: score !== null ? (score >= 70 ? "Good" : "Needs Work") : "—" },
          ].map((m, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <m.icon className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-white/40">{m.label}</p>
                  <p className="font-semibold text-white capitalize">{m.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {score !== null && (
        <div className="relative mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-8 flex flex-col items-center justify-center animate-scale-in">
            <p className="text-sm text-white/40 mb-3">Efficiency Score</p>
            <div className={`text-7xl font-bold ${scoreColor} mb-2`}>{score}<span className="text-3xl">/100</span></div>
            <p className="text-lg font-medium text-white capitalize">{details?.rating}</p>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
            {details?.issues?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Issues Found</h4>
                <ul className="text-sm text-white/50 space-y-2 list-disc list-inside">{details.issues.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
              </div>
            )}
            {details?.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                <ul className="text-sm text-white/50 space-y-2 list-disc list-inside">{details.recommendations.map((r: string, idx: number) => <li key={idx}>{r}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
