import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { Zap } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isLogin
        ? await api.login({ email, password })
        : await api.register({ email, password });
      setToken(data.access_token);
      const user = await api.me();
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 glass rounded-2xl">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FlowCast</h1>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-center mb-5 sm:mb-6">
          {isLogin ? 'Sign in to your account' : 'Create an account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-base"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-base"
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-base"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
