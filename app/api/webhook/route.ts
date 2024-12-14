// app/api/webhook/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Your webhook logic here

    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
