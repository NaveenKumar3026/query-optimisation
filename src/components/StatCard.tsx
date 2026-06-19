import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-accent">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  );
}
