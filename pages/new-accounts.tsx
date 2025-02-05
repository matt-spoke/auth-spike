import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import cookies from 'js-cookie'

const logoutEndpoint = 'https://shopify.com/authentication/1360134207/logout';

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

const getLogoutUrl = () => {
  const idToken = cookies.get('idToken');

  if (!idToken) {
    return undefined;
  }
  
  const logoutUrl = new URL(logoutEndpoint);
  logoutUrl.searchParams.append('id_token_hint', idToken);
  logoutUrl.searchParams.append('return_url', 'https://swan-great-pup.ngrok-free.app/new-accounts')
    return logoutUrl.toString();
}

const ProtectedPage: React.FC = () => {
  const [user, setUser] = useState<Customer>();
  const router = useRouter();

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
      const logoutUrl = getLogoutUrl();

      console.log('logoutUrl', logoutUrl)

      // TODO can we logout via API so we can secure idToken with HttpOnly
      if (logoutUrl) {
        window.location.href = logoutUrl
      }

    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    user ? (<div>
      <h1>{user.emailAddress.emailAddress}</h1>
      <p>You are logged in on a Shopify Customer Accounts protected page!</p>
      <button 
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </button>
    </div>) : (<button onClick={() => router.push("/api/auth/login")}>Log in with Shopify</button>)
  );
};

export default ProtectedPage;
