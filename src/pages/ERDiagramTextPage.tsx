import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeAI } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { GitBranch, Loader2, Sparkles, ArrowRight } from "lucide-react";

interface Entity {
  name: string;
  columns: string[];
}

interface Relationship {
  from: string;
  to: string;
  label: string;
}

export default function ERDiagramTextPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const data = await invokeAI("nl-to-sql", {
        input: `Based on this schema description, return a JSON object with two arrays: "entities" (each with "name" and "columns" array of strings) and "relationships" (each with "from", "to", and "label"). Only return valid JSON, no markdown.\n\nDescription: ${description}`,
      });
      const cleaned = data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setEntities(parsed.entities || []);
      setRelationships(parsed.relationships || []);
      toast.success("ER Diagram generated!");
    } catch (err: any) {
      toast.error("Failed to parse diagram. Try a clearer description.");
    } finally { setLoading(false); }
  };

  const colors = [
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-violet-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
  ];

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">ER Diagram — Text Input</h1>
        <p className="text-white/40 mt-1">Describe your schema and generate a visual ER diagram</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <h3 className="font-semibold text-white mb-3">Describe Your Schema</h3>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A blog system with users, posts, and comments. Users have name and email. Posts have title, body, and author. Comments belong to a post and a user..."
            className="min-h-[200px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25"
          />
          <Button onClick={generate} disabled={loading} className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate ER Diagram
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {entities.length === 0 ? (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-12 flex flex-col items-center justify-center animate-slide-up">
              <GitBranch className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Describe your schema to generate the diagram</p>
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
