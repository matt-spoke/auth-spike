import { GetServerSideProps } from 'next';
import { useEffect, useState } from "react";

const authEndpoint = 'https://shopify.com/authentication/1360134207/oauth/authorize';
const clientId = 'shp_385b7444-f896-4a2f-8d4d-af5cdd459a5c';
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
const getAuthUrl = () => {
  const authorizationRequestUrl = new URL(
    authEndpoint,
  );

  authorizationRequestUrl.searchParams.append(
    'scope',
    'openid email customer-account-api:full'
  );

  authorizationRequestUrl.searchParams.append(
    'client_id',
    clientId
  );

  authorizationRequestUrl.searchParams.append(
    'response_type',
    'code'
  );

  authorizationRequestUrl.searchParams.append(
    'redirect_uri',
    redirectUri
  );

  const state = generateState(); // I guess returned as a prop?
  console.log('generated state', state)

  authorizationRequestUrl.searchParams.append(
    'state',
    state,
  );

  const nonce = generateNonce(16); // I guess returned as prop?

  console.log('generated nonce', nonce)

  authorizationRequestUrl.searchParams.append(
    'nonce',
    nonce
  );
  
  return authorizationRequestUrl
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // console.log('context.req.cookies', context.req.cookies)
  const { newAccountsToken } = context.req.cookies;

  // console.log('newAccounrtsToek', newAccountsToken)
  if (!newAccountsToken) {
    return {
      redirect: {
        destination: getAuthUrl().toString(),
        permanent: false,
      },
    };
  }

  // Optionally validate the token with Shopify

  return {
    props: { },
  };
};

type Customer = {
  emailAddress: {
    emailAddress: string;
  };
};

type CustomerReponse = {
  data: {
    customer: Customer;
  };

}

const ProtectedPage: React.FC = () => {
  const [user, setUser] = useState<Customer>();
  // const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: CustomerReponse) => setUser(data.data.customer))
      .catch(() => setUser(undefined));
  }, []);

  console.log('data', user);

  const handleLogout = async () => {
    console.log('logout ?')
    try {
      const response = await fetch('/api/auth/logout');

      if (response.ok) {
        // Redirect to home page or login page after successful logout
        window.location.href = '/new-accounts';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <h1>{user?.emailAddress.emailAddress}</h1>
      <p>You are logged in on a Shopify Customer Accounts protected page!</p>
      <button 
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </button>
    </div>
  );
};

export default ProtectedPage;
