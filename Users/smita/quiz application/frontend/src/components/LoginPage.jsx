import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSuccess }) {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = isRegister ? api.register : api.login;
      const data = await fn(username, password);
      login(data.token, data.user);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="glass rounded-3xl p-8 w-full max-w-md shadow-glow"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-white via-accent-glow to-accent-cyan bg-clip-text text-transparent">
            Quiz Arena
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {isRegister ? 'Create your account' : 'Sign in to start the challenge'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Username</label>
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
              animate={{
                boxShadow:
                  focused === 'username'
                    ? '0 0 0 2px rgba(124, 58, 237, 0.6), 0 0 20px rgba(124, 58, 237, 0.2)'
                    : '0 0 0 1px rgba(255,255,255,0.1)',
              }}
              className="w-full px-4 py-3 rounded-xl bg-surface-elevated/80 text-white outline-none transition-colors"
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Password</label>
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              animate={{
                boxShadow:
                  focused === 'password'
                    ? '0 0 0 2px rgba(124, 58, 237, 0.6), 0 0 20px rgba(124, 58, 237, 0.2)'
                    : '0 0 0 1px rgba(255,255,255,0.1)',
              }}
              className="w-full px-4 py-3 rounded-xl bg-surface-elevated/80 text-white outline-none transition-colors"
              placeholder="Enter password"
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-display font-semibold bg-gradient-to-r from-accent to-violet-600 text-white shadow-glow disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Start Quiz'}
          </motion.button>
        </form>

        <motion.button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          whileHover={{ color: '#a78bfa' }}
          className="w-full mt-4 text-sm text-white/50 hover:text-accent-glow transition-colors"
        >
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </motion.button>
      </motion.div>
    </div>
  );
}
