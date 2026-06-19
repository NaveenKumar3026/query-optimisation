import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { BookOpen, Loader2, Sparkles, Code, FileText, Lightbulb } from "lucide-react";

export default function QueryExplanationPage() {
  const [sql, setSQL] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      const d = await invokeAI("nl-to-sql", {
        input: `Explain this SQL query in simple English. Do not generate SQL, just explain what it does step by step:\n${sql}`,
      });
      setExplanation(d.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Query Explanation</h1>
        <p className="text-white/40 mt-1">Understand any SQL query in plain English</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">SQL Query</h3>
            </div>
            <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste SQL to explain..." className="min-h-[200px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 font-mono text-sm" />
            <Button onClick={explain} disabled={loading} className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Explain Query
            </Button>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="font-medium text-white text-sm">Tips</h4>
            </div>
            <ul className="text-xs text-white/40 space-y-1 list-disc list-inside">
              <li>Paste complex JOINs for detailed breakdowns</li>
              <li>Works with subqueries and CTEs</li>
              <li>AI explains each clause step-by-step</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Explanation</h3>
          </div>
          {explanation ? (
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{explanation}</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-white/20">
              <BookOpen className="w-12 h-12 mb-3" />
              <p className="text-sm">Paste SQL and click Explain to see results</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
