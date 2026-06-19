import TopNavbar from "./TopNavbar";

export default function DashboardLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen ${className || "bg-background"}`}>
      <TopNavbar />
      <main className="pt-16 pb-8 px-4 md:px-8 max-w-[1600px] mx-auto animate-page-enter">
        {children}
      </main>
    </div>
  );
}
