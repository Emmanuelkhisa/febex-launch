// Supabase Edge Function: log-visit
// Collects visitor IP, country, and visit counts for the countdown page

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getClientIP(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0].trim();
    if (ip) return ip;
  }
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return null;
}

async function lookupGeo(ip: string): Promise<{ country: string | null; city: string | null }> {
  try {
    // Skip private/localhost IPs
    if (ip === '127.0.0.1' || ip === '::1') return { country: null, city: null };
    const resp = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { 'User-Agent': 'febex-edge-fn' } });
    if (!resp.ok) return { country: null, city: null };
    const j = await resp.json();
    return { country: j.country_name ?? null, city: j.city ?? null };
  } catch (_e) {
    return { country: null, city: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnon) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon);

  const ip = getClientIP(req);
  const ua = req.headers.get('user-agent') ?? null;

  if (!ip) {
    return new Response(JSON.stringify({ ok: false, reason: 'no-ip' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const geo = await lookupGeo(ip);

  // Check if there's an existing record for this IP
  const { data: existing, error: selErr } = await supabase
    .from('visitor_analytics')
    .select('id, visit_count')
    .eq('ip_address', ip)
    .maybeSingle();

  if (selErr) {
    console.error('Select error', selErr);
  }

  let result: any = null;
  if (existing) {
    const { data, error } = await supabase
      .from('visitor_analytics')
      .update({
        visit_count: (existing.visit_count ?? 0) + 1,
        last_visit: new Date().toISOString(),
        country: geo.country ?? undefined,
        city: geo.city ?? undefined,
        user_agent: ua ?? undefined,
      })
      .eq('id', existing.id)
      .select('id, visit_count')
      .maybeSingle();
    if (error) {
      console.error('Update error', error);
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    result = data;
  } else {
    const { data, error } = await supabase
      .from('visitor_analytics')
      .insert({
        ip_address: ip,
        country: geo.country,
        city: geo.city,
        visit_count: 1,
        user_agent: ua,
      })
      .select('id, visit_count')
      .maybeSingle();
    if (error) {
      console.error('Insert error', error);
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    result = data;
  }

  return new Response(JSON.stringify({ ok: true, id: result?.id, visit_count: result?.visit_count }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
