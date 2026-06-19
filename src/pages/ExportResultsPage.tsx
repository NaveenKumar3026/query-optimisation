import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, Eye } from "lucide-react";

export default function ExportResultsPage() {
  const [data, setData] = useState('[{"id": 1, "name": "Example", "value": 100}, {"id": 2, "name": "Demo", "value": 250}]');
  const [preview, setPreview] = useState<any[]>([]);

  const tryPreview = () => {
    try { const parsed = JSON.parse(data); if (Array.isArray(parsed)) setPreview(parsed); else toast.error("Data must be a JSON array"); }
    catch { toast.error("Invalid JSON"); }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.length) { toast.error("No data"); return; }
      const headers = Object.keys(parsed[0]);
      const csv = [headers.join(","), ...parsed.map((row: any) => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))].join("\n");
      downloadFile(csv, "export.csv", "text/csv");
      toast.success("CSV exported!");
    } catch { toast.error("Invalid JSON"); }
  };

  const exportJSON = () => {
    try { JSON.parse(data); downloadFile(data, "export.json", "application/json"); toast.success("JSON exported!"); }
    catch { toast.error("Invalid JSON"); }
  };

  return (
    <DashboardLayout className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">Export Results</h1>
        <p className="text-white/40 mt-1">Download your query results in multiple formats</p>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up">
          <h3 className="font-semibold text-white mb-3">Data Input</h3>
          <Textarea value={data} onChange={(e) => setData(e.target.value)} placeholder="Paste JSON array..." className="min-h-[200px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 font-mono text-xs" />
          <div className="flex gap-3 mt-4">
            <Button onClick={exportCSV} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={exportJSON} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <FileJson className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>
          <Button onClick={tryPreview} variant="ghost" className="mt-2 w-full text-white/50 hover:text-white hover:bg-white/[0.04]">
            <Eye className="w-4 h-4 mr-2" /> Preview Data
          </Button>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-semibold text-white mb-3">Preview</h3>
          {preview.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {Object.keys(preview[0]).map(k => (
                      <th key={k} className="text-left p-3 text-white/60 text-xs uppercase font-medium">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="p-3 text-white/50 text-xs">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-white/20">
              <Download className="w-12 h-12 mb-3" />
              <p className="text-sm">Click Preview to see data table</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
