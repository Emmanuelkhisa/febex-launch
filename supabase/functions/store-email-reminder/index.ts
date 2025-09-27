import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface EmailReminderRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailReminderRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store email reminder
    const { data, error } = await supabase
      .from('email_reminders')
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ message: 'Email already registered for reminders' }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      throw error;
    }

    console.log('Email reminder stored:', data);

    // Send confirmation email with rich HTML content
    try {
      const emailResponse = await resend.emails.send({
        from: "FEBEX Group <info@febexgroup.com>",
        to: [email],
        subject: "🚀 FEBEX Group Launch Reminder Set!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin-bottom: 10px;">🚀 FEBEX Group</h1>
              <p style="color: #666; font-size: 18px; margin: 0;">Launch Reminder Confirmed!</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: white; font-size: 24px; margin: 0 0 15px 0;">You're All Set! 🎉</h2>
              <p style="color: white; font-size: 16px; margin: 0; opacity: 0.9;">We'll send you a reminder email 1 day before our official launch on <strong>November 1st, 2025 at 10:00 AM EAT</strong>.</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">What to Expect</h3>
              <ul style="color: #666; font-size: 16px; line-height: 1.6; padding-left: 20px;">
                <li>Exceptional service from FEBEX Group</li>
                <li>Innovative solutions tailored to your needs</li>
                <li>Access to our official website and services</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://febexgroup.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">Visit Our Official Site</a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Get ready for something amazing! 🌟<br>
                <a href="https://febexgroup.com" style="color: #667eea; text-decoration: none;">febexgroup.com</a>
              </p>
            </div>
          </div>
        `,
      });

      console.log('Confirmation email sent:', emailResponse);
    } catch (emailError: any) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the entire request if email sending fails
    }

    return new Response(
      JSON.stringify({ 
        message: 'Email reminder registered successfully',
        data: data 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in store-email-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);