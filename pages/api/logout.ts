import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', 'shopifyToken=; Max-Age=0; Path=/; HttpOnly; Secure');
    res.status(200).json({ message: 'Logged out' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
