import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify it's a successful Paystack payment
    if (body.event === 'charge.success') {
      // Extract the job_id from Paystack metadata
      const jobId = body.data?.metadata?.job_id;

      if (jobId) {
        // Update job status in Supabase
        const { error } = await supabaseAdmin
          .from('jobs')
          .update({ status: 'paid_pending_approval' })
          .eq('id', jobId);

        if (error) {
          console.error('Supabase update failed:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`Job ${jobId} updated to paid_pending_approval`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}