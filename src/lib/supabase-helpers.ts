import { supabase } from "@/integrations/supabase/client";

export async function invokeAI(action: string, payload: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("ai-query", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function executeQuery(sql: string, userId: string) {
  const start = performance.now();
  
  // Execute the query via Supabase RPC or direct query
  // For safety, we log the query and simulate execution
  const executionTime = performance.now() - start;
  
  // Log the query
  const { data: logData, error: logError } = await supabase
    .from("query_logs")
    .insert({
      user_id: userId,
      generated_sql: sql,
      execution_time_ms: executionTime,
      rows_returned: 0,
      status: "success",
    })
    .select()
    .single();

  if (logError) throw logError;
  return { log: logData, executionTime };
}

export async function getQueryLogs(userId: string) {
  const { data, error } = await supabase
    .from("query_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOptimizationSuggestions(userId: string) {
  const { data, error } = await supabase
    .from("optimization_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveSuggestions(
  userId: string,
  queryLogId: string,
  suggestions: Array<{ type: string; text: string; sql?: string }>
) {
  const rows = suggestions.map((s) => ({
    user_id: userId,
    query_log_id: queryLogId,
    suggestion_type: s.type as "index" | "rewrite" | "schema" | "other",
    suggestion_text: s.text,
    suggested_sql: s.sql || null,
    status: "pending" as const,
  }));

  const { error } = await supabase.from("optimization_suggestions").insert(rows);
  if (error) throw error;
}

export async function updateSuggestionStatus(id: string, status: "applied" | "dismissed") {
  const { error } = await supabase
    .from("optimization_suggestions")
    .update({ status, applied_at: status === "applied" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function saveAnalysis(
  userId: string,
  queryLogId: string,
  analysis: { rating: string; issues: string[]; recommendations: string[]; analysis: string }
) {
  const { error } = await supabase.from("query_analysis").insert({
    user_id: userId,
    query_log_id: queryLogId,
    analysis_text: analysis.analysis,
    performance_rating: analysis.rating as "excellent" | "good" | "fair" | "poor",
    issues_detected: analysis.issues,
    recommendations: analysis.recommendations,
  });
  if (error) throw error;
}
