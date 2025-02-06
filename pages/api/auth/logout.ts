import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idToken = req.cookies.idToken; // Extract from cookies

  console.log('idToken', idToken);
  if (!idToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    res.setHeader('Set-Cookie', [
      serialize('idToken', '', { maxAge: -1, path: '/' }),
      serialize('refreshToken', '', { maxAge: -1, path: '/' }),
      serialize('newAccountsToken', '', { maxAge: -1, path: '/' })
      ]);
    res.redirect('https://swan-great-pup.ngrok-free.app/new-accounts')

  } catch (error) {
    const e = error as Error;
    console.error("Error logging out:", e.message);
    res.status(500).json({ error: "Failed to log out" });
  }
}
