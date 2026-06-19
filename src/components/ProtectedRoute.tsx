import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="animate-pulse-soft text-primary font-semibold text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
