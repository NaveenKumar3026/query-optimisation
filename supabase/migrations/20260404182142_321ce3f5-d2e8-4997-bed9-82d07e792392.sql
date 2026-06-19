
-- Create query_logs table
CREATE TABLE public.query_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  natural_language_input TEXT,
  generated_sql TEXT NOT NULL,
  execution_time_ms NUMERIC,
  rows_returned INTEGER DEFAULT 0,
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query logs" ON public.query_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own query logs" ON public.query_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own query logs" ON public.query_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_query_logs_user_id ON public.query_logs(user_id);
CREATE INDEX idx_query_logs_created_at ON public.query_logs(created_at DESC);

-- Create query_analysis table
CREATE TABLE public.query_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_log_id UUID REFERENCES public.query_logs(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'fair', 'poor')),
  issues_detected JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.query_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis" ON public.query_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis" ON public.query_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_query_analysis_user_id ON public.query_analysis(user_id);

-- Create optimization_suggestions table
CREATE TABLE public.optimization_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_log_id UUID REFERENCES public.query_logs(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('index', 'rewrite', 'schema', 'other')),
  suggestion_text TEXT NOT NULL,
  suggested_sql TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.optimization_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" ON public.optimization_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suggestions" ON public.optimization_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suggestions" ON public.optimization_suggestions FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_optimization_suggestions_user_id ON public.optimization_suggestions(user_id);
