import type { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'svix';
import { IncomingMessage } from 'http';
import getRawBodyLib from 'raw-body';

// Disable Next.js's default body parser to access raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

const SVIX_SECRET = process.env.SVIX_SECRET || 'your_default_svix_secret';

const wh = new Webhook(SVIX_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Retrieve headers required by Svix
    const headers = {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    };

    // Get raw body
    const rawBody = await getRawBody(req);

    // Verify the payload using Svix
    const payload = wh.verify(rawBody, headers);

    console.log('Verified webhook payload:', payload);

    // TODO: Add your business logic here (e.g., update database, trigger actions)

    res.status(200).json({ message: 'Webhook received and verified successfully' });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(400).json({ message: 'Invalid signature' });
  }
}

async function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    getRawBodyLib(req, {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: 'utf-8',
    }, (err, string) => {
      if (err) return reject(err);
      resolve(string);
    });
  });
}
