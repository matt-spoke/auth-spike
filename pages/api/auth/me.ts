import { parse } from "cookie";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const clientId = process.env.SHOPIFY_CLIENT_ID!;
// const clientSecret = process.env.SHOPIFY_CLIENT_SECRET; // for confidential clients
const tokenEndpoint = 'https://shopify.com/authentication/1360134207/oauth/token';

// const credentials = btoa(`${clientId}:${clientSecret}`); // for confidential clients

interface ShopifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function setTokenCookies(res: NextApiResponse, tokens: ShopifyTokens) {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
  };

  res.setHeader('Set-Cookie', [
    serialize('newAccountsToken', tokens.access_token, { ...cookieOptions,     maxAge: tokens.expires_in }),
    serialize('refreshToken', tokens.refresh_token, cookieOptions)
  ]);
}

async function refreshShopifyToken(refreshToken: string): Promise<ShopifyTokens | null> {
  try {
    const body = new URLSearchParams();
    body.append("client_id", clientId);
    body.append("grant_type", 'refresh_token');
    body.append("refresh_token", refreshToken);

    const headers = {
      "content-type": "application/x-www-form-urlencoded",
      // Confidential Client
      // 'Authorization': `Basic ${credentials}`
    };

    console.log('refresging token', tokenEndpoint)

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: headers,
      body,
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', (error as Error).message);
    return null;
  }
}

export const withTokenRefresh = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies.newAccountsToken;
    const refreshToken = cookies.refreshToken;

    console.log('HERE?')
    // console.log('cookies', cookies)
    console.log('accessToken', accessToken)
    console.log('refreshToken', refreshToken)

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'No tokens present' });
    }

    try {
      // If no access token (but we did have the refresh token), can we assume it's expired?
      if (refreshToken && !accessToken) {
        console.log('no access token, but we have refresh token');
        const newTokens = await refreshShopifyToken(refreshToken);
        console.log('newTokens', newTokens);
        if (newTokens) {
          setTokenCookies(res, newTokens);
          req.cookies = { ...req.cookies, newAccountsToken: newTokens.access_token, refreshToken: newTokens.refresh_token}
        }
      }

      return handler(req, res);
    } catch (error) {
      // If token verification fails, try refresh
      const newTokens = await refreshShopifyToken(refreshToken!);
      if (!newTokens) {
        return res.status(401).json({ error: `Authentication failed with error ${(error as Error).message}` });
      }

      setTokenCookies(res, newTokens);
      return handler(req, res);
    }
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const access_token = req.cookies.newAccountsToken; // Extract from cookies

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  console.log('we are in ME with access token', access_token)

  try {
    console.log('ME??')

    const response = await fetch(`${process.env.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN}/account/customer/api/2025-01/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token,
        },
        body: JSON.stringify({
          operationName: 'SomeQuery',
          query: 'query { customer { emailAddress { emailAddress }}}',
          variables: {},
        }),
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch account details', response.statusText);
      return res.status(response.status).json({ error: 'Failed to account details', e: response.statusText })
    }

    console.log('happy with token??', response)

    const data = await response.json();

    console.log('response data', data);

    res.status(200).json(data);
  } catch (error) {
    const e = error as Error;
    console.error("Error fetching user data:", e.message);
    res.status(500).json({ error: "Failed to fetch customer data" });
  }
}

export default withTokenRefresh(handler);
