import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const LoginForm = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin({ email, password });
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-900/60 border border-slate-800" hoverEffect={false}>
      <h2 className="text-xl font-extrabold text-slate-100 text-center mb-6">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          loading={loading}
          className="mt-2 py-3"
        >
          Sign In
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;
