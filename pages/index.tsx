// pages/index.js
import React from 'react';

type UserType = {
  data: {
    name: {
      first: string;
      last: string;
    }
    email: string;
    picture: {
      large: string;
    }
  }
}
const HomePage = ({ data }: UserType ) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Dick around</h1>
      <p>This page is server-side rendered!</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Random User:</h2>
        <p><strong>Name:</strong> {data.name.first} {data.name.last}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <img src={data.picture.large} alt="User" style={{ borderRadius: '50%' }} />
      </div>
    </div>
  );
};

// This function runs on the server before rendering the page
export async function getServerSideProps() {
  // Fetching data from a random user API
  const res = await fetch('https://randomuser.me/api/');
  const { results } = await res.json();

  // Sending the first user as props
  return {
    props: {
      data: results[0],
    },
  };
}

export default HomePage;
