import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access_token = req.cookies.newAccountsToken; // Extract from cookies

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // const { SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN } = process.env;

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
        return res.status(response.status).json({ error: 'Failed to account details', e: response.statusText })
    }

    const data = await response.json();

    console.log('response data', data);

    res.status(200).json(data);
  } catch (error) {
    const e = error as Error;
    console.error("Error fetching user data:", e.message);
    res.status(500).json({ error: "Failed to fetch customer data" });
  }
}
