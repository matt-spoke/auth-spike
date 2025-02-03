import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('context.req.cookies', context.req.cookies)
  const { storeFrontToken } = context.req.cookies;

  if (!storeFrontToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Optionally validate the token with Shopify

  return {
    props: {}, // Pass data to the page if needed
  };
};

const ProtectedPage: React.FC = () => {
  return <div>Welcome to the protected page!</div>;
};

export default ProtectedPage;
