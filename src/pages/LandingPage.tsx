import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Zap, Shield, BarChart3, Database, ArrowRight, Brain,
  Mic, Gauge, DollarSign, BookOpen, Download, Layers, GitBranch,
} from "lucide-react";

const features = [
  { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered Queries", description: "Convert natural language to Oracle SQL instantly with our intelligent AI engine." },
  { icon: <Zap className="w-6 h-6" />, title: "Auto Optimization", description: "Get real-time query optimization suggestions and index recommendations." },
  { icon: <Shield className="w-6 h-6" />, title: "Secure & Isolated", description: "Each user gets isolated database access with enterprise-grade security." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Performance Analytics", description: "Track query performance with interactive charts and trend analysis." },
  { icon: <Database className="w-6 h-6" />, title: "Dynamic Schema", description: "Create, modify, and manage database tables through an intuitive interface." },
  { icon: <Brain className="w-6 h-6" />, title: "AI Insights", description: "Voice-to-SQL, cost estimation, query scoring, and schema visualization." },
];

const advancedFeatures = [
  { icon: Mic, title: "Voice to SQL", desc: "Speak naturally and watch AI generate perfect Oracle SQL queries.", gradient: "from-cyan-500 to-blue-600" },
  { icon: Gauge, title: "Optimization Score", desc: "Get a detailed efficiency rating for every query you write.", gradient: "from-emerald-500 to-teal-600" },
  { icon: DollarSign, title: "Cost Estimation", desc: "Understand query cost before execution with AI-powered analysis.", gradient: "from-pink-500 to-violet-600" },
  { icon: BookOpen, title: "Query Explanation", desc: "Translate complex SQL into plain English anyone can understand.", gradient: "from-purple-500 to-indigo-600" },
  { icon: GitBranch, title: "ER Diagrams", desc: "Generate visual ER diagrams from text or voice descriptions.", gradient: "from-amber-500 to-orange-600" },
  { icon: Layers, title: "Schema Visualizer", desc: "Interactive diagrams showing tables, columns, and relationships.", gradient: "from-teal-500 to-cyan-600" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6366f1]">
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <nav className="relative flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 animate-logo-reveal">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-white">QueryAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")} className="text-white/70 hover:text-white hover:bg-white/10">Login</Button>
          <Button onClick={() => navigate("/auth")} className="bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-lg">
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      <section className="relative max-w-5xl mx-auto text-center pt-16 md:pt-24 pb-16 px-6 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur text-white/90 text-sm font-medium mb-6 border border-white/[0.1]">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Next-Generation AI Database Platform
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          From Natural Language to
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Optimized Oracle Queries
          </span>
        </h1>
        <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock intelligent data operations effortlessly. Transform spoken or typed questions into
          production-ready SQL with AI-powered optimization, cost analysis, and real-time insights.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-indigo-700 hover:bg-white/90 font-semibold w-full sm:w-auto shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            Start Your Intelligent Query Journey <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => navigate("/auth")} className="text-white border border-white/20 hover:bg-white/10 w-full sm:w-auto">
            View Demo
          </Button>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="bg-white/[0.05] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08] hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Advanced AI Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advancedFeatures.map((f, i) => (
            <div key={i} className={`bg-gradient-to-br ${f.gradient} rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
              <f.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/[0.1] p-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Database Workflow?</h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">Join thousands of developers using AI to write better, faster, and more efficient SQL queries.</p>
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-lg">
            Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06] py-8 text-center text-sm text-white/30">
        <p>© 2026 QueryAI — AI-Powered Database Management Platform</p>
      </footer>
    </div>
  );
}
