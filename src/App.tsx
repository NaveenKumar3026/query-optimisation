import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import QueryPage from "./pages/QueryPage";
import QueryLogsPage from "./pages/QueryLogsPage";
import DatabaseRecordsPage from "./pages/DatabaseRecordsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import VoiceToSQLPage from "./pages/VoiceToSQLPage";
import OptimizationScorePage from "./pages/OptimizationScorePage";
import CostEstimationPage from "./pages/CostEstimationPage";
import QueryExplanationPage from "./pages/QueryExplanationPage";
import ExportResultsPage from "./pages/ExportResultsPage";
import SchemaVisualizerPage from "./pages/SchemaVisualizerPage";
import ERDiagramTextPage from "./pages/ERDiagramTextPage";
import ERDiagramVoicePage from "./pages/ERDiagramVoicePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/query" element={<ProtectedRoute><QueryPage /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><QueryLogsPage /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><DatabaseRecordsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/voice-to-sql" element={<ProtectedRoute><VoiceToSQLPage /></ProtectedRoute>} />
            <Route path="/optimization-score" element={<ProtectedRoute><OptimizationScorePage /></ProtectedRoute>} />
            <Route path="/cost-estimation" element={<ProtectedRoute><CostEstimationPage /></ProtectedRoute>} />
            <Route path="/query-explanation" element={<ProtectedRoute><QueryExplanationPage /></ProtectedRoute>} />
            <Route path="/export-results" element={<ProtectedRoute><ExportResultsPage /></ProtectedRoute>} />
            <Route path="/schema-visualizer" element={<ProtectedRoute><SchemaVisualizerPage /></ProtectedRoute>} />
            <Route path="/er-diagram-text" element={<ProtectedRoute><ERDiagramTextPage /></ProtectedRoute>} />
            <Route path="/er-diagram-voice" element={<ProtectedRoute><ERDiagramVoicePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
