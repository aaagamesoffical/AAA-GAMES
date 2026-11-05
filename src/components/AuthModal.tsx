import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Gamepad2,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
}

const GAMER_AVATARS = [
  '⚡ Cyber Titan',
  '🎮 Neon Phantom',
  '🛡️ Apex Knight',
  '🔥 Dragon Slayer',
  '🎯 Ghost Sniper'
];

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  storeName = 'AAA GAMES'
}) => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    adminEmail, 
    isAdminBypassActive, 
    toggleAdminBypass 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(GAMER_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Please choose your gamer tag or username.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, `${displayName.trim()} (${selectedAvatar})`);
      } else if (mode === 'signin') {
        await loginWithEmail(email.trim(), password);
      } else if (mode === 'forgot') {
        setSuccessNotice('If this account exists, password recovery instructions have been dispatched.');
        setLoading(false);
        return;
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please check your credentials or create an account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in or use Google login.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/40 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden text-white my-auto flex flex-col">
        
        {/* Futuristic Top Glowing Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-lg text-white tracking-tight">
                  {mode === 'signin' ? 'Sign In to ' : mode === 'signup' ? 'Create Account on ' : 'Reset Password '}
                  <span className="text-emerald-400">{storeName}</span>
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {mode === 'signin'
                  ? 'Access your Game Vault, keys & instant activations'
                  : mode === 'signup'
                  ? 'Join 15,000+ gamers with lifetime warranty'
                  : 'Enter email to receive password reset link'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-900/60 text-xs font-bold text-center">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessNotice('');
              }}
              className={`py-3 transition-colors ${
                mode === 'signin'
                  ? 'bg-zinc-950 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessNotice('');
              }}
              className={`py-3 transition-colors ${
                mode === 'signup'
                  ? 'bg-zinc-950 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Body Form */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-2 text-zinc-600 text-[11px] font-mono">
                <div className="flex-1 border-t border-zinc-800" />
                <span className="px-3">or continue with email</span>
                <div className="flex-1 border-t border-zinc-800" />
              </div>
            </>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">
                    Gamer Tag / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. PhoenixGamer99"
                      className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 font-semibold mb-1">
                    Select Gamer Title:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {GAMER_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setSelectedAvatar(av)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          selectedAvatar === av
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-300 font-semibold">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-zinc-400 hover:text-white absolute right-3 top-2.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Connecting...'
                  : mode === 'signin'
                  ? 'Sign In to Game Vault'
                  : mode === 'signup'
                  ? 'Register Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-center text-xs text-zinc-400 hover:text-white pt-1"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {/* Admin Account Notice & Preview Bypass */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Admin Account</span>
              </div>
              <p>
                Logging in with <strong className="text-zinc-200">{adminEmail}</strong> unlocks full control of games, pricing, UPI scanner &amp; orders.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-zinc-500 text-[11px]">Developer Mode:</span>
              <button
                type="button"
                onClick={toggleAdminBypass}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isAdminBypassActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isAdminBypassActive ? 'Admin Mode ACTIVE' : 'Enable Admin Preview'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
