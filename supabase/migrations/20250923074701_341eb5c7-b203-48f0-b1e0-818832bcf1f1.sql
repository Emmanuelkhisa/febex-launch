-- Create a table for email reminders
CREATE TABLE public.email_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication)
CREATE POLICY "Allow public insert to email reminders" 
ON public.email_reminders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to email reminders" 
ON public.email_reminders 
FOR SELECT 
USING (true);