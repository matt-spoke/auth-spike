import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
