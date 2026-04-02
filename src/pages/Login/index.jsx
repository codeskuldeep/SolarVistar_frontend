import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../context/slices/authSlice';

import { 
  Eye, 
  EyeSlash, 
  WarningCircle,
  Sun,
  Moon,
  SolarPanel
} from '@phosphor-icons/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [email, password, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-transparent hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
        
        {/* Solar Branding */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <SolarPanel size={22} weight="fill" className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">SolarVistar</span>
              <span className="block text-[10px] font-medium text-yellow-600 dark:text-yellow-400 tracking-wider uppercase -mt-0.5">CRM Platform</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your solar energy operations
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-dark-surface py-8 px-6 sm:px-8 rounded-xl border border-gray-200 dark:border-dark-border transition-colors">
          
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-3 rounded-lg flex items-start">
              <WarningCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" weight="fill" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-400 sm:text-sm transition-colors"
                placeholder="name@solarvistar.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-400 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Utility Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-gray-300 dark:border-dark-border text-green-600 dark:text-green-500 focus:ring-blue-500 dark:focus:ring-blue-400 bg-transparent cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-dark-bg disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
          
        </div>

        {/* Footer */}
        <div className="mt-6 text-center sm:text-left">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            For technical support, contact your system administrator.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
