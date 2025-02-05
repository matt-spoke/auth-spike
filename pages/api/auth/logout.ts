import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idToken = req.cookies.idToken; // Extract from cookies

  console.log('idToken', idToken);
  if (!idToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    res.setHeader('Set-Cookie', [
        'idToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'newAccountsToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
    res.redirect('https://swan-great-pup.ngrok-free.app/new-accounts')

  } catch (error) {
    const e = error as Error;
    console.error("Error logging out:", e.message);
    res.status(500).json({ error: "Failed to log out" });
  }
}
