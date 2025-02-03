// pages/auth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

const clientId = 'shp_36ce6743-7f72-48f2-83f9-685c7f12dcf6';
const apiSecretKey = 'ccd5a42ff0f7ed022efa6804c5f928f9bd2190b8fb43673afd5dc40eb4b5c539';
const host = 'https://swan-great-pup.ngrok-free.app';
const publicShop = 'spoke-1.myshopify.com'

export default function Auth() {
  const router = useRouter();

  useEffect(() => {
    const shopify = shopifyApi({
      apiKey: clientId,
      apiSecretKey: apiSecretKey,
      scopes: ['read_customers'],
      hostName: host,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    });

    const authUrl = shopify.auth.begin({
      shop: publicShop,
      callbackPath: '/api/auth/callback',
      isOnline: false,
      rawRequest: {},
    });

    console.log('authUrl', authUrl)

    // router.push(authUrl);
  }, [router]);

  return <div>Redirecting to Shopify...</div>;
}