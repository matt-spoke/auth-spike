import React, { useState } from 'react';
import cookies from 'js-cookie'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setError('');
        console.log('Logged in:', data);
        const cookieResp = cookies.set('shopifyToken', data.accessToken, {
          path: '/'
        });
        console.log('repon', cookieResp)
        // document.cookie = cookieResp;

      } else {
        setError(data[0]?.message || 'Invalid login');
        setSuccess(false);
      }
    } catch (err) {
      const error = err as Error;
      console.log('error message', error.message)
      setError('Something went wrong');
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Logged in successfully!</p>}
    </form>
  );
};

export default LoginForm;
