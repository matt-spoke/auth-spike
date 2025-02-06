import { NextApiRequest, NextApiResponse } from "next";

// async function refreshShopifyToken(refreshToken: string): Promise<ShopifyTokens | null> {
//   try {
//     const response = await fetch('https://shopify.com/oauth/access_token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         client_id: process.env.SHOPIFY_CLIENT_ID,
//         client_secret: process.env.SHOPIFY_CLIENT_SECRET,
//         refresh_token: refreshToken,
//         grant_type: 'refresh_token',
//       }),
//     });

//     if (!response.ok) {
//       return null;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Token refresh error:', error);
//     return null;
//   }
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access_token = req.cookies.newAccountsToken; // Extract from cookies

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

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

    // if (response.status === 401) {
    //   const newTokens = await refreshShopifyToken(refreshToken);
    //   if (!newTokens) {
    //     return res.status(401).json({ error: 'Unable to refresh token' });
    //   }

    //   // Set new cookies
    //   setTokenCookies(res, newTokens);

    //   // Retry the request with new access token
    //   const retryResponse = await fetch('https://api.shopify.com/admin/api/2023-01/shop.json', {
    //     headers: {
    //       'Authorization': `Bearer ${newTokens.access_token}`,
    //     },
    //   });

    //   if (!retryResponse.ok) {
    //     return res.status(401).json({ error: 'Authentication failed' });
    //   }

    //   const data = await retryResponse.json();
    //   return res.status(200).json({ data });
    // }

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
