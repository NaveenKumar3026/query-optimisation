import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import {
  Mic, MicOff, Loader2, Sparkles, Download, Database,
  ArrowRight, Gauge, DollarSign, BookOpen,
} from "lucide-react";

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("voice");

  return (
    <DashboardLayout>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground">AI Insights Dashboard</h1>
        <p className="text-muted-foreground mt-1">Advanced AI-powered database intelligence</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "voice", label: "Voice-to-SQL", icon: Mic },
          { id: "score", label: "Optimization Score", icon: Gauge },
          { id: "cost", label: "Cost Estimation", icon: DollarSign },
          { id: "explain", label: "AI Explanation", icon: BookOpen },
          { id: "export", label: "Export Results", icon: Download },
          { id: "schema", label: "Schema Visualizer", icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-page-enter">
        {activeTab === "voice" && <VoiceToSQL />}
        {activeTab === "score" && <OptimizationScore />}
        {activeTab === "cost" && <CostEstimation />}
        {activeTab === "explain" && <AIExplanation />}
        {activeTab === "export" && <ExportResults />}
        {activeTab === "schema" && <SchemaVisualizer />}
      </div>
    </DashboardLayout>
  );
}

function VoiceToSQL() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
    };

    recognition.onerror = () => {
      toast.error("Speech recognition error. Try again.");
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const convertToSQL = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("nl-to-sql", { input: transcript });
      const sql = data.result.replace(/```sql\n?/g, "").replace(/```\n?/g, "").trim();
      setGeneratedSQL(sql);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" /> Voice-to-SQL
        </h3>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              listening
                ? "bg-destructive text-destructive-foreground animate-pulse-soft shadow-lg"
                : "gradient-accent text-primary-foreground hover-glow"
            }`}
          >
            {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          <p className="text-sm text-muted-foreground">
            {listening ? "Listening... Speak your query" : "Click to start speaking"}
          </p>

          {transcript && (
            <div className="w-full mt-2">
              <label className="text-sm font-medium text-foreground mb-1 block">Transcript</label>
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="bg-background/50" />
              <Button onClick={convertToSQL} disabled={loading} className="mt-3 w-full" variant="hero">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Convert to SQL
              </Button>
            </div>
          )}
        </div>
      </div>

      {generatedSQL && (
        <div className="glass-card rounded-xl p-6 animate-scale-in">
          <h3 className="font-semibold text-foreground mb-3">Generated SQL</h3>
          <pre className="bg-foreground/5 rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
            {generatedSQL}
          </pre>
        </div>
      )}
    </div>
  );
}

function OptimizationScore() {
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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = score !== null
    ? score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500"
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" /> Query Optimization Score
        </h3>
        <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste your SQL query here..." className="min-h-[120px] bg-background/50" />
        <Button onClick={analyze} disabled={loading} className="mt-3 w-full" variant="hero">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Analyze Score
        </Button>
      </div>

      {score !== null && (
        <div className="glass-card rounded-xl p-6 animate-scale-in flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-2">Efficiency Score</p>
          <div className={`text-6xl font-bold ${scoreColor} mb-2`}>{score}<span className="text-2xl">/100</span></div>
          <p className="text-sm font-medium text-foreground capitalize">{details?.rating}</p>
          {details?.issues?.length > 0 && (
            <div className="mt-4 w-full">
              <p className="text-xs font-semibold mb-1 text-foreground">Issues:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {details.issues.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CostEstimation() {
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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const costLevel = result?.rating === "excellent" || result?.rating === "good" ? "optimized" : "expensive";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Query Cost Estimation
        </h3>
        <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste SQL to estimate cost..." className="min-h-[120px] bg-background/50" />
        <Button onClick={estimate} disabled={loading} className="mt-3 w-full" variant="hero">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Estimate Cost
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-6 animate-scale-in">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${costLevel === "optimized" ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`font-semibold text-lg ${costLevel === "optimized" ? "text-green-600" : "text-red-500"}`}>
              {costLevel === "optimized" ? "🟢 Optimized" : "🔴 Expensive"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.analysis}</p>
          {result.recommendations?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold mb-1 text-foreground">Recommendations:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {result.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIExplanation() {
  const [sql, setSQL] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("nl-to-sql", { input: `Explain this SQL query in simple English. Do not generate SQL, just explain what it does step by step:\n${sql}` });
      setExplanation(data.result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> AI Query Explanation
        </h3>
        <Textarea value={sql} onChange={(e) => setSQL(e.target.value)} placeholder="Paste SQL to explain..." className="min-h-[120px] bg-background/50" />
        <Button onClick={explain} disabled={loading} className="mt-3 w-full" variant="hero">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Explain Query
        </Button>
      </div>

      {explanation && (
        <div className="glass-card rounded-xl p-6 animate-scale-in">
          <h3 className="font-semibold text-foreground mb-3">Explanation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{explanation}</p>
        </div>
      )}
    </div>
  );
}

function ExportResults() {
  const [data, setData] = useState('[{"id": 1, "name": "Example", "value": 100}]');

  const exportCSV = () => {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) { toast.error("No data to export"); return; }
      const headers = Object.keys(parsed[0]);
      const csv = [headers.join(","), ...parsed.map((row: any) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","))].join("\n");
      downloadFile(csv, "export.csv", "text/csv");
      toast.success("CSV exported!");
    } catch { toast.error("Invalid JSON data"); }
  };

  const exportJSON = () => {
    try {
      JSON.parse(data);
      downloadFile(data, "export.json", "application/json");
      toast.success("JSON exported!");
    } catch { toast.error("Invalid JSON data"); }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up max-w-2xl">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" /> Export Results
      </h3>
      <Textarea value={data} onChange={(e) => setData(e.target.value)} placeholder="Paste JSON data to export..." className="min-h-[150px] bg-background/50 font-mono text-xs" />
      <div className="flex gap-3 mt-4">
        <Button onClick={exportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <Button onClick={exportJSON} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export JSON
        </Button>
      </div>
    </div>
  );
}

function SchemaVisualizer() {
  const tables = [
    {
      name: "query_logs",
      columns: ["id (uuid)", "user_id (uuid)", "natural_language_input", "generated_sql", "execution_time_ms", "rows_returned", "status", "created_at"],
      color: "from-primary to-accent",
    },
    {
      name: "query_analysis",
      columns: ["id (uuid)", "user_id (uuid)", "query_log_id (uuid)", "analysis_text", "performance_rating", "issues_detected", "recommendations", "created_at"],
      color: "from-accent to-peach-500",
    },
    {
      name: "optimization_suggestions",
      columns: ["id (uuid)", "user_id (uuid)", "query_log_id (uuid)", "suggestion_type", "suggestion_text", "suggested_sql", "status", "applied_at", "created_at"],
      color: "from-peach-500 to-peach-600",
    },
  ];

  return (
    <div className="animate-slide-up">
      <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" /> Schema Visualizer
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.name} className="glass-card-hover rounded-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${table.color} px-4 py-3`}>
              <h4 className="font-semibold text-primary-foreground text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                {table.name}
              </h4>
            </div>
            <div className="p-4 space-y-1.5">
              {table.columns.map((col, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${i < 2 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  <span className={`font-mono ${i < 2 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {col}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Relationships */}
      <div className="mt-6 glass-card rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-3 text-sm">Relationships</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary" />
            <span><strong className="text-foreground">query_analysis</strong>.query_log_id → <strong className="text-foreground">query_logs</strong>.id</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary" />
            <span><strong className="text-foreground">optimization_suggestions</strong>.query_log_id → <strong className="text-foreground">query_logs</strong>.id</span>
          </div>
        </div>
      </div>
    </div>
  );
}
