import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.credibleartisans.com';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'african-remote-job';

async function getServiceToken(): Promise<string | null> {
  const email = `${APP_ID}_webhook@service.local`;
  const password = `${APP_ID}_webhook_secret_key_2026!`;

  try {
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, email, password }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      return data?.accessToken || data?.token || null;
    }

    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: APP_ID,
        email,
        password,
        role: 'admin',
        custom_claims: { service: 'paystack_webhook' },
      }),
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      return regData?.accessToken || regData?.token || null;
    }
  } catch (err) {
    console.error('Webhook service auth error:', err);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.event === 'charge.success') {
      const jobId = body.data?.metadata?.job_id;

      if (jobId) {
        const token = await getServiceToken();
        if (!token) {
          return NextResponse.json({ error: 'Backend authentication failed' }, { status: 500 });
        }

        const updateRes = await fetch(`${BACKEND_URL}/data/jobs/${encodeURIComponent(jobId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'paid_pending_approval',
            is_paid: true,
            payment_ref: body.data?.reference || null,
          }),
        });

        if (!updateRes.ok) {
          const errText = await updateRes.text();
          console.error('Custom backend job update failed:', errText);
          return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
        }

        console.log(`Job ${jobId} updated to paid_pending_approval`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err?.message || 'Invalid webhook payload' }, { status: 400 });
  }
}
