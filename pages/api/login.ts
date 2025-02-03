import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const SHOPIFY_API_URL = 'https://spoke-staging-eu.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_API_KEY = '49b8eb7792b0f262b07eb97df446f44b';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('req.body', req.body)
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = { input: { email, password } };

    try {
      const response = await axios.post(
        SHOPIFY_API_URL,
        { query, variables },
        {
          headers: {
            'X-Shopify-Storefront-Access-Token': SHOPIFY_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('AM I SERVER', JSON.stringify(response.data))

      const data = response.data.data.customerAccessTokenCreate;
      if (data.customerAccessToken) {
        res.status(200).json(data.customerAccessToken);
      } else {
        res.status(400).json(data.customerUserErrors);
      }
    } catch (error) {
      res.status(500).json({ error: `Something went wrong: ${(error as Error).message}` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
