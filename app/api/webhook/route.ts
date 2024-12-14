import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Your webhook logic here
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/email/bounce`, payload);

    console.log('API response:', response.data);

    return NextResponse.json({ message: 'Webhook received and processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}