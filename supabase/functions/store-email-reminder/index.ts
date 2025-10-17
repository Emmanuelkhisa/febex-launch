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

    // Send confirmation email with FEBEX brand template
    try {
      const emailResponse = await resend.emails.send({
        from: "FEBEX Group <info@febexgroup.com>",
        to: [email],
        subject: "🚀 FEBEX Group Launch Reminder Set!",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>FEBEX Group Launch Reminder</title>
  <style>
    a:hover { text-decoration: underline; }
    p { line-height: 1.6; margin: 10px 0; }
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #F59E0B;
      color: #1E3A8A;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
    }
    .cta-button:hover { background-color: #e58e00; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .header td { padding: 15px !important; }
      .header img { width: 60px !important; }
      .header h2 { font-size: 20px !important; }
      .header p { font-size: 14px !important; }
      .content td { padding: 20px !important; font-size: 14px !important; }
      .footer td { padding: 15px !important; font-size: 12px !important; }
      .footer img { width: 24px !important; }
      .cta-button { padding: 10px 20px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family:Arial, sans-serif; color:#E2E8F0;">
  <div style="display:none;">Your FEBEX Group launch reminder is confirmed!</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Container -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#1C1C1C; border-radius:8px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td class="header" style="background-color:#F59E0B; color:#1E3A8A; padding:20px; text-align:left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:80px; vertical-align:middle;">
                    <img src="https://febexgroup.netlify.app/uploads/F-logo.jpg" alt="FEBEX Group Logo" width="80" style="border-radius:4px;">
                  </td>
                  <td style="text-align:center;">
                    <h2 style="margin:0; font-size:24px; color:#1E3A8A; font-weight:bold;">FEBEX Group</h2>
                    <p style="margin:8px 0 0; font-size:16px; color:#1E3A8A;">Building Trust, Growth and Collaboration</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content" style="padding:30px; color:#E2E8F0; font-size:16px; text-align:left;">
              <p style="margin-top:0; font-size:20px; color:#F59E0B; font-weight:bold;">🎉 You're All Set!</p>
              
              <p>Thank you for signing up for our launch reminder! We're thrilled to have you on board as we prepare for something extraordinary.</p>
              
              <p><strong style="color:#F59E0B;">We'll notify you 1 day before our official launch on November 1st, 2025 at 10:00 AM EAT.</strong></p>
              
              <div style="background-color:#172554; border-left:4px solid #F59E0B; padding:15px; margin:20px 0; border-radius:4px;">
                <p style="margin:0; font-weight:bold; color:#F59E0B;">What is FEBEX Group?</p>
                <p style="margin:8px 0 0;">FEBEX Group is an innovative Online Forex Account Management & Investment Platform. We bridge the gap between expert traders and investors through our unique profit-sharing model, trading on behalf of non-traders with tailored solutions that benefit everyone.</p>
              </div>
              
              <p><strong>What to Expect:</strong></p>
              <ul style="color:#E2E8F0; line-height:1.8; margin:10px 0; padding-left:20px;">
                <li>Professional forex account management by experienced traders</li>
                <li>Fair profit-sharing models designed for mutual success</li>
                <li>Transparent operations with your interests first</li>
                <li>A platform built on trust, growth, and collaboration</li>
              </ul>
              
              <p style="text-align:center; margin:25px 0;">
                <a href="https://febexgroup.com" class="cta-button">Visit Our Website</a>
              </p>
              
              <p>Stay tuned for more updates as we approach the launch date. Get ready to be part of something amazing!</p>
              
              <p style="margin-bottom:0;">For any inquiries, reach us at <a href="mailto:info@febexgroup.com" style="color:#F59E0B; text-decoration:none;">info@febexgroup.com</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color:#172554; padding:20px; text-align:center; font-size:14px; color:#E2E8F0;">
              <p style="margin:8px 0; font-weight:bold;">FEBEX Group - Building Trust, Growth and Collaboration</p>
              <p style="margin:8px 0;">Online Forex Account Management & Investment Platform</p>
              <p style="margin:8px 0;">FEBEX Group, Westlands, Nairobi, Kenya</p>
              <p style="margin:8px 0;">
                <a href="https://febexgroup.com" style="color:#F59E0B; text-decoration:none;">febexgroup.com</a>
              </p>
              <!-- Social Icons -->
              <p style="margin:12px 0;">
                <a href="https://x.com/febex_official" target="_blank" rel="noopener noreferrer" style="margin:0 8px;">
                  <img src="https://febexgroup.netlify.app/uploads/X.png" alt="Twitter/X" width="28" style="vertical-align:middle;">
                </a>
                <a href="https://instagram.com/febexgroup" target="_blank" rel="noopener noreferrer" style="margin:0 8px;">
                  <img src="https://febexgroup.netlify.app/uploads/IG.png" alt="Instagram" width="28" style="vertical-align:middle;">
                </a>
                <a href="https://facebook.com/febexgroup" target="_blank" rel="noopener noreferrer" style="margin:0 8px;">
                  <img src="https://febexgroup.netlify.app/uploads/FB.png" alt="Facebook" width="28" style="vertical-align:middle;">
                </a>
                <a href="https://tiktok.com/@febexgroup_official" target="_blank" rel="noopener noreferrer" style="margin:0 8px;">
                  <img src="https://febexgroup.netlify.app/uploads/TOK.png" alt="TikTok" width="28" style="vertical-align:middle;">
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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