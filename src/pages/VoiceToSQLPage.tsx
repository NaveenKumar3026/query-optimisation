import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Mic, MicOff, Loader2, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default function VoiceToSQLPage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported"); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onresult = (e: any) => { setTranscript(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => { toast.error("Speech error"); setListening(false); };
    r.onend = () => setListening(false);
    recognitionRef.current = r; r.start(); setListening(true);
  };

  const convert = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const d = await invokeAI("nl-to-sql", { input: transcript });
      setGeneratedSQL(d.result.replace(/```sql\n?/g, "").replace(/```\n?/g, "").trim());
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Voice to SQL</h1>
        <p className="text-white/40 mt-1">Speak naturally to generate Oracle SQL queries instantly</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-8 animate-slide-up">
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={toggleListening}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                listening
                  ? "bg-red-500 text-white animate-pulse-soft scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : "bg-white/[0.08] text-white hover:bg-white/[0.12] hover:scale-105 border border-white/[0.1]"
              }`}
            >
              {listening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
            </button>
            <p className="text-white/60 text-sm">{listening ? "Listening... speak your query" : "Tap to start speaking"}</p>

            {listening && (
              <div className="flex items-center gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-1 bg-cyan-400/60 rounded-full animate-pulse" style={{
                    height: `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 0.05}s`,
                  }} />
                ))}
              </div>
            )}

            {transcript && (
              <div className="w-full mt-4">
                <label className="text-sm font-medium text-white/80 mb-2 block">Transcript</label>
                <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30" />
                <Button onClick={convert} disabled={loading} className="mt-3 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Convert to Oracle SQL
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Sparkles, title: "AI Powered", desc: "Advanced NLP converts speech to structured Oracle SQL" },
            { icon: Zap, title: "Instant Results", desc: "Get your SQL query in milliseconds" },
            { icon: Shield, title: "Secure", desc: "All processing is encrypted and isolated" },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {generatedSQL && (
        <div className="relative mt-6 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
          <h3 className="font-semibold text-white mb-3">Generated Oracle SQL</h3>
          <pre className="bg-black/30 rounded-lg p-4 text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">{generatedSQL}</pre>
        </div>
      )}
    </DashboardLayout>
  );
}
