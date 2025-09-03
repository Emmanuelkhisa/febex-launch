-- Create table for visitor analytics
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  country TEXT,
  city TEXT,
  visit_count INTEGER NOT NULL DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_visitor_analytics_ip ON public.visitor_analytics(ip_address);
CREATE INDEX idx_visitor_analytics_country ON public.visitor_analytics(country);
CREATE INDEX idx_visitor_analytics_last_visit ON public.visitor_analytics(last_visit);

-- Enable Row Level Security (though we'll allow public access for analytics)
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading analytics data
CREATE POLICY "Allow public read access to visitor analytics" 
ON public.visitor_analytics 
FOR SELECT 
USING (true);

-- Create policy to allow inserting new visitor data
CREATE POLICY "Allow public insert to visitor analytics" 
ON public.visitor_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow updating visit counts
CREATE POLICY "Allow public update to visitor analytics" 
ON public.visitor_analytics 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_visitor_analytics_updated_at
BEFORE UPDATE ON public.visitor_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();