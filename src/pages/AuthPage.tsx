import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill in all fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        await signUp(email, password);
        toast.success("Account created! You can now log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      if (msg.includes("Invalid login credentials")) toast.error("Incorrect email or password.");
      else if (msg.includes("User not found")) toast.error("No account found with this email.");
      else if (msg.includes("already registered")) toast.error("This email is already registered.");
      else toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6366f1] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative bg-white/[0.06] backdrop-blur-2xl rounded-2xl p-8 w-full max-w-md animate-scale-in border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-center gap-3 mb-8 animate-logo-reveal">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">QueryAI</span>
        </div>

        <h2 className="text-xl font-semibold text-center text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-center text-white/50 mb-6">
          {isLogin ? "Sign in to your AI Database Control Center" : "Start optimizing your queries today"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/80 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" size="lg" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 font-semibold hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
