import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Mic, MicOff, Loader2, Sparkles, ArrowRight, GitBranch } from "lucide-react";

interface Entity { name: string; columns: string[]; }
interface Relationship { from: string; to: string; label: string; }

export default function ERDiagramVoicePage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
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

  const generate = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("nl-to-sql", {
        input: `Based on this schema description, return a JSON object with two arrays: "entities" (each with "name" and "columns" array of strings) and "relationships" (each with "from", "to", and "label"). Only return valid JSON, no markdown.\n\nDescription: ${transcript}`,
      });
      const cleaned = data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setEntities(parsed.entities || []);
      setRelationships(parsed.relationships || []);
      toast.success("ER Diagram generated from voice!");
    } catch {
      toast.error("Failed to generate diagram. Try again.");
    } finally { setLoading(false); }
  };

  const colors = ["from-indigo-500 to-blue-600", "from-purple-500 to-violet-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-pink-500 to-rose-600", "from-cyan-500 to-sky-600"];

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">ER Diagram — Voice Input</h1>
        <p className="text-white/40 mt-1">Speak your schema description and generate a visual ER diagram</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <div className="flex flex-col items-center gap-4 mb-4">
            <button
              onClick={toggleListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                listening
                  ? "bg-red-500 text-white animate-pulse-soft scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : "bg-white/[0.08] text-white hover:bg-white/[0.12] hover:scale-105 border border-white/[0.1]"
              }`}
            >
              {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-white/50 text-sm">{listening ? "Listening..." : "Tap to describe schema"}</p>
          </div>

          {listening && (
            <div className="flex items-center justify-center gap-1 h-6 mb-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 bg-purple-400/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 6}px`, animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
          )}

          {transcript && (
            <>
              <label className="text-sm font-medium text-white/80 mb-2 block">Transcript</label>
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 min-h-[100px]" />
              <Button onClick={generate} disabled={loading} className="mt-3 w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate ER Diagram
              </Button>
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {entities.length === 0 ? (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-12 flex flex-col items-center justify-center animate-slide-up">
              <GitBranch className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Speak your schema to generate the ER diagram</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entities.map((entity, i) => (
                  <div key={i} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden animate-scale-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`bg-gradient-to-r ${colors[i % colors.length]} px-5 py-3`}>
                      <h3 className="font-bold text-white text-sm">{entity.name}</h3>
                    </div>
                    <div className="p-4 space-y-1">
                      {entity.columns.map((col, j) => (
                        <div key={j} className="text-xs text-white/60 py-1 px-2 rounded hover:bg-white/[0.04] font-mono">{col}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {relationships.length > 0 && (
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-scale-in">
                  <h3 className="font-semibold text-white mb-4">Relationships</h3>
                  <div className="space-y-3">
                    {relationships.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
                        <span className="px-3 py-1.5 bg-white/[0.06] rounded-md text-xs font-mono text-indigo-400">{r.from}</span>
                        <ArrowRight className="w-4 h-4 text-white/30" />
                        <span className="px-3 py-1.5 bg-white/[0.06] rounded-md text-xs font-mono text-emerald-400">{r.to}</span>
                        <span className="text-xs text-white/30 ml-auto">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
