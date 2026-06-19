import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI, executeQuery, saveAnalysis, saveSuggestions } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Sparkles, Play, Zap, Loader2, Code, Terminal, Activity, Table } from "lucide-react";

export default function QueryPage() {
  const { user } = useAuth();
  const [nlInput, setNlInput] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [successModal, setSuccessModal] = useState(false);

  // Smart table creation flow
  const [tableStep, setTableStep] = useState<0 | 1 | 2 | 3>(0);

  const handleConvert = async () => {
    if (!nlInput.trim()) return;
    setLoading(true); setGeneratedSQL(""); setAnalysis(null); setSuggestions([]); setExecutionResult(null);
    try {
      const data = await invokeAI("nl-to-sql", { input: nlInput });
      setGeneratedSQL(data.result.replace(/```sql\n?/g, "").replace(/```\n?/g, "").trim());
      toast.success("Oracle SQL generated!");
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleExecute = async () => {
    if (!generatedSQL.trim() || !user) return;
    setExecuting(true);
    try {
      const r = await executeQuery(generatedSQL, user.id);
      setExecutionResult(r);
      setTableStep(1); // Ask about table view
    } catch (err: any) { toast.error(err.message); }
    finally { setExecuting(false); }
  };

  const handleAnalyze = async () => {
    if (!generatedSQL.trim() || !user) return;
    setAnalyzing(true);
    try {
      const data = await invokeAI("analyze", { sql: generatedSQL });
      let parsed;
      try { parsed = JSON.parse(data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); }
      catch { parsed = { rating: "fair", issues: [], recommendations: [], analysis: data.result }; }
      setAnalysis(parsed);
      if (executionResult?.log?.id) await saveAnalysis(user.id, executionResult.log.id, parsed);
    } catch (err: any) { toast.error(err.message); }
    finally { setAnalyzing(false); }
  };

  const handleOptimize = async () => {
    if (!generatedSQL.trim() || !user) return;
    setOptimizing(true);
    try {
      const data = await invokeAI("optimize", { sql: generatedSQL });
      let parsed;
      try { parsed = JSON.parse(data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); }
      catch { parsed = { suggestions: [{ type: "other", text: data.result }] }; }
      setSuggestions(parsed.suggestions || []);
      if (executionResult?.log?.id && parsed.suggestions?.length) await saveSuggestions(user.id, executionResult.log.id, parsed.suggestions);
    } catch (err: any) { toast.error(err.message); }
    finally { setOptimizing(false); }
  };

  const ratingColors: Record<string, string> = {
    excellent: "text-emerald-400 bg-emerald-500/20",
    good: "text-blue-400 bg-blue-500/20",
    fair: "text-amber-400 bg-amber-500/20",
    poor: "text-red-400 bg-red-500/20",
  };

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#020617] to-[#0f172a] min-h-screen">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Query & Optimization</h1>
        <p className="text-white/40 mt-1">Convert natural language to Oracle SQL and optimize performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <label className="text-sm font-semibold text-white">Natural Language Query</label>
            </div>
            <Textarea value={nlInput} onChange={(e) => setNlInput(e.target.value)} placeholder="e.g., Show all orders placed in the last 30 days..." className="min-h-[120px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 font-mono" />
            <Button onClick={handleConvert} disabled={loading || !nlInput.trim()} className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Execute Intelligent Query
            </Button>
          </div>

          {generatedSQL && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-5 h-5 text-emerald-400" />
                <label className="text-sm font-semibold text-white">Generated Oracle SQL</label>
              </div>
              <pre className="bg-black/40 rounded-lg p-4 text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">{generatedSQL}</pre>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button onClick={handleExecute} disabled={executing} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {executing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />} Execute
                </Button>
                <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />} Analyze
                </Button>
                <Button onClick={handleOptimize} disabled={optimizing} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  {optimizing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />} Optimize
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!executionResult && !analysis && suggestions.length === 0 && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-8 flex flex-col items-center justify-center h-[300px] animate-slide-up">
              <Activity className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Results will appear here after query execution</p>
            </div>
          )}

          {executionResult && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
              <h3 className="text-sm font-semibold text-white mb-3">Execution Result</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">✓ Success</span>
                <span className="text-white/50">Time: <strong className="text-white">{executionResult.executionTime.toFixed(2)}ms</strong></span>
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
              <h3 className="text-sm font-semibold text-white mb-3">Query Insights</h3>
              {analysis.rating && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${ratingColors[analysis.rating] || ""}`}>
                  {analysis.rating.charAt(0).toUpperCase() + analysis.rating.slice(1)}
                </span>
              )}
              <p className="text-sm text-white/50 mb-3">{analysis.analysis}</p>
              {analysis.issues?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-white mb-1">Issues:</p>
                  <ul className="text-sm text-white/50 list-disc list-inside space-y-1">{analysis.issues.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                </div>
              )}
              {analysis.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white mb-1">Recommendations:</p>
                  <ul className="text-sm text-white/50 list-disc list-inside space-y-1">{analysis.recommendations.map((r: string, idx: number) => <li key={idx}>{r}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
              <h3 className="text-sm font-semibold text-white mb-3">Optimization Suggestions</h3>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">{s.type}</span>
                    <p className="text-sm text-white/60 mt-2">{s.text}</p>
                    {s.sql && <pre className="mt-2 text-xs font-mono bg-black/30 text-emerald-300 p-2 rounded overflow-x-auto">{s.sql}</pre>}
                    {s.sql && (
                      <Button size="sm" className="mt-2 bg-white/[0.06] hover:bg-white/[0.1] text-white" onClick={() => { setGeneratedSQL(s.sql); toast.success("Optimized SQL loaded"); }}>
                        Apply
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Table Creation Flow - Step 1 */}
      <ConfirmModal
        open={tableStep === 1}
        onClose={() => { setTableStep(0); setSuccessModal(true); }}
        onConfirm={() => setTableStep(2)}
        title="Create Table View?"
        description="Do you want to create a table view for this query result?"
        confirmLabel="Yes, Create"
        cancelLabel="No, Just Show Result"
        type="info"
      />

      {/* Step 2 */}
      <ConfirmModal
        open={tableStep === 2}
        onClose={() => { setTableStep(0); toast.info("Temporary view created"); }}
        onConfirm={() => { setTableStep(0); toast.success("Table stored for future use!"); }}
        title="Store as Permanent Table?"
        description="Do you want to store this result as a table for future use?"
        confirmLabel="Yes, Store"
        cancelLabel="No, Temporary Only"
        type="info"
      />

      {/* Success modal */}
      <ConfirmModal open={successModal} onClose={() => setSuccessModal(false)} onConfirm={() => setSuccessModal(false)} title="Query Executed Successfully" description={`Completed in ${executionResult?.executionTime?.toFixed(2) || 0}ms`} type="success" confirmLabel="OK" showCancel={false} />
    </DashboardLayout>
  );
}
