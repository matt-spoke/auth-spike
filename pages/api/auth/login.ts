import { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "../../../utils/encryption";
import { serialize } from "cookie";

const authEndpoint = 'https://shopify.com/authentication/1360134207/oauth/authorize';
const clientId = process.env.SHOPIFY_CLIENT_ID!;
const redirectUri = 'https://swan-great-pup.ngrok-free.app/api/auth/callback';

export async function generateCodeVerifier() {
  const rando = generateRandomCode();
  return base64UrlEncode(rando);
}

export async function generateCodeChallenge(codeVerifier: string) {
  const digestOp = await crypto.subtle.digest(
    { name: "SHA-256" },
    new TextEncoder().encode(codeVerifier)
  );
  const hash = convertBufferToString(digestOp);
  return base64UrlEncode(hash);
}

function generateRandomCode() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return String.fromCharCode.apply(null, Array.from(array));
}

function base64UrlEncode(str: string) {
  const base64 = btoa(str);
  // This is to ensure that the encoding does not have +, /, or = characters in it.
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function convertBufferToString(hash: ArrayBuffer) {
  const uintArray = new Uint8Array(hash);
  const numberArray = Array.from(uintArray);
  return String.fromCharCode(...numberArray);
}

export function generateState(): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return timestamp + randomString;
}

export function generateNonce(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters.charAt(randomIndex);
  }

  return nonce;
}

const getAuthUrl = (nonce: string, state: string) => {
  const authorizationRequestUrl = new URL(authEndpoint);

  authorizationRequestUrl.searchParams.append(
    'scope',
    'openid email customer-account-api:full'
  );

  authorizationRequestUrl.searchParams.append('client_id', clientId);

  authorizationRequestUrl.searchParams.append('response_type', 'code');

  authorizationRequestUrl.searchParams.append('redirect_uri', redirectUri);

  authorizationRequestUrl.searchParams.append('state', state);

  console.log('generated nonce', nonce);

  authorizationRequestUrl.searchParams.append("nonce", nonce);

  return authorizationRequestUrl;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nonce = generateNonce(16);
  const encryptedNonce = encrypt(nonce);

  const state = generateState();
  const encryptedState = encrypt(state);

  res.setHeader('Set-Cookie', [
    serialize("auth_nonce", encryptedNonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    }),
    serialize('auth_state', encryptedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    }),
  ]);

  res.redirect(getAuthUrl(nonce, state).toString());
}
