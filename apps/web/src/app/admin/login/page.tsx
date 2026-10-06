'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError('Invalid credentials');
      return;
    }

    const data = await res.json();
    document.cookie = `milkman_token=${data.token}; path=/; max-age=86400`;
    router.push('/admin');
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <h1>Admin</h1>
        <p>Sign in to manage orders and delivery.</p>
        <form onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="checkout-button" type="submit">
            <span>Sign in</span>
          </button>
        </form>
        <Link className="back-link" href="/">
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
