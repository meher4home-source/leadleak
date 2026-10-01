// POST /api/lead -> inserts into Supabase table "leads"
// Env vars (Vercel): SUPABASE_URL, SUPABASE_SERVICE_KEY

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = String(body.email || '').trim().toLowerCase();

  // Honeypot: bots fill this field. Pretend success.
  if (body.company) return res.status(200).json({ ok: true });

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const row = {
    email,
    source: String(body.source || 'leadleak').slice(0, 40),
    inputs: typeof body.inputs === 'object' && body.inputs ? body.inputs : null,
  };

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) return res.status(502).json({ error: 'Storage failed' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Storage failed' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
