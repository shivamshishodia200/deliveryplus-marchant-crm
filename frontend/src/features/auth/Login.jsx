import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, GitPullRequest, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { CrmLogo } from '../../components/layout/DeliveryPlusLogo';
import { useAuth } from '../../app/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@enterprise-crm.com');
  const [password, setPassword] = useState('EnterpriseCRM2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'merchant') {
        navigate('/merchant-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('EnterpriseCRM2026!');
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans">
      {/* Left Column: Brand Hero (Preserves Exact Starry Visual Theme from Image 2) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#080e22] via-[#0c1535] to-[#080d1f] text-white overflow-hidden border-r border-slate-800">
        {/* Subtle Starry background stars */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Logo */}
        <div className="relative z-10">
          <CrmLogo />
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Close More Deals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Manage Better.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              All-in-one platform to manage leads, pipelines, customer accounts, quotations &amp; reports — seamlessly.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-brand-teal flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Lead &amp; Account Management</h4>
                <p className="text-xs text-slate-400">Capture, score, and automatically convert leads into corporate accounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Interactive Kanban Pipeline</h4>
                <p className="text-xs text-slate-400">Visual deal stages, weighted probabilities &amp; revenue forecasting.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Invoicing &amp; Quotations</h4>
                <p className="text-xs text-slate-400">Authoritative server calculations, product catalog line items &amp; taxes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Executive BI &amp; Reports</h4>
                <p className="text-xs text-slate-400">Real-time conversion funnels, stage breakdowns &amp; authorized CSV exports.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
          <span>Enterprise CRM Suite v1.0</span>
          <span>© 2026 Enterprise CRM Platform</span>
        </div>
      </div>

      {/* Right Column: Sign In Form (Preserves Exact White Clean Style from Image 2) */}
      <div className="flex flex-col justify-center flex-1 p-6 sm:p-12 md:p-16 bg-white">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              Welcome Back! <span className="text-2xl">👋</span>
            </h2>
            <p className="text-sm text-slate-500">
              Login to manage your enterprise CRM.
            </p>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Quick 1-Click Demo Login:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDemoUser('admin@enterprise-crm.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('manager@enterprise-crm.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                Sales Manager
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('sarah.sales@enterprise-crm.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Sales Rep
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute w-4 h-4 text-slate-400 left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute w-4 h-4 text-slate-400 left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-2.5 pl-10 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute p-1 text-slate-400 hover:text-slate-600 right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-orange-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please ask your Super Admin to reset password.'); }} className="font-semibold text-brand-orange hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-500/25 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Use your administrator credentials to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};
