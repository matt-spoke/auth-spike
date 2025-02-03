import { NextApiRequest, NextApiResponse } from "next";

const logoutEndpoint = 'https://shopify.com/authentication/1360134207/logout';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idToken = req.cookies.idToken; // Extract from cookies

  console.log('idToken', idToken);
  if (!idToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const logoutUrl = new URL(logoutEndpoint);
    logoutUrl.searchParams.append('id_token_hint', idToken );
    const response = await fetch(logoutUrl);
    
    if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to logout', e: response.statusText })
    }

    console.log('logged out')

    res.setHeader('Set-Cookie', [
        'idToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'newAccountsToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
    res.status(200).json({})

  } catch (error) {
    const e = error as Error;
    console.error("Error logging out:", e.message);
    res.status(500).json({ error: "Failed to log out" });
  }
}
