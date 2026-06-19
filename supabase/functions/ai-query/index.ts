import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, input, sql, schema } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "nl-to-sql") {
      systemPrompt = `You are an Oracle SQL expert. Convert natural language queries to valid Oracle SQL statements.
Rules:
- Output ONLY the SQL query, nothing else
- Use proper Oracle SQL syntax
- Use VARCHAR2 instead of VARCHAR
- Use ROWNUM or FETCH FIRST n ROWS ONLY for limiting results
- Use Oracle-compatible DATE handling (TO_DATE, SYSDATE, etc.)
- Use Oracle JOIN syntax
- Use NVL instead of COALESCE where appropriate
- Use DUAL table for simple expressions
- If the user mentions creating tables, use CREATE TABLE with Oracle types
- If the user mentions inserting data, use INSERT INTO
- For queries, use SELECT with proper WHERE clauses
- Be smart about inferring table and column names
${schema ? `\nAvailable schema:\n${schema}` : ""}`;
      userPrompt = input;
    } else if (action === "analyze") {
      systemPrompt = `You are a database performance analyst specializing in Oracle SQL. Analyze the given SQL query and provide:
1. Performance Assessment (excellent/good/fair/poor)
2. Potential Issues (list any detected issues)
3. Recommendations for improvement (Oracle-specific optimizations)
Respond in JSON format: { "rating": "...", "issues": ["..."], "recommendations": ["..."], "analysis": "..." }`;
      userPrompt = `Analyze this Oracle SQL query:\n${sql}`;
    } else if (action === "optimize") {
      systemPrompt = `You are an Oracle SQL optimization expert. Given a SQL query, suggest optimizations including:
1. Query rewrites for better performance (Oracle-specific)
2. Index suggestions (provide CREATE INDEX statements for Oracle)
3. Schema improvements
4. Use Oracle hints where applicable (/*+ ... */)
Respond in JSON format: { "suggestions": [{ "type": "index|rewrite|schema|other", "text": "description", "sql": "suggested SQL if applicable" }] }`;
      userPrompt = `Optimize this Oracle SQL query:\n${sql}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-query error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
