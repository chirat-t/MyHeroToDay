'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Config } from '../../config';

// ---------- Reusable Minimal Button ----------
const variants = {
  whitePill: [
    // ปุ่มขาวทรงแคปซูลเหมือนในภาพ
    'w-full rounded-full px-5 py-2.5 font-semibold',
    'bg-white text-slate-900',
    'shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)]',
    'hover:bg-white/95 active:scale-[0.98]',
    'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
  ].join(' '),

  // สำรองสไตล์อื่น ๆ เผื่อใช้ต่อ
  luxe: [
    'rounded-lg px-4 py-2 font-medium text-white',
    'bg-gradient-to-b from-slate-500/70 to-slate-700/70',
    'hover:from-slate-500/80 hover:to-slate-800/80',
    'border border-white/20 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)]',
    'backdrop-blur-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
  ].join(' '),
};

type MinimalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
};

function MinimalButton({
  variant = 'whitePill',
  loading,
  className = '',
  children,
  ...props
}: MinimalButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={[
        variants[variant],
        className,
        loading || props.disabled ? 'opacity-60 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" className="opacity-30" />
            <path d="M21 12a9 9 0 0 1-9 9" />
          </svg>
        )}
        <span>{children}</span>
      </span>
    </button>
  );
}

// ---------- SignIn Page ----------

type SignInResponse = {
  token: string;
  user?: { id: number; name?: string; username: string };
  message?: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSignIn = async () => {
    if (loading) return;
    const u = username.trim();
    const p = password;
    if (!u || !p) {
      Swal.fire({ title: 'Login', text: 'กรอกข้อมูลให้ครบก่อนนะ', icon: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const url = `${Config.apiUrl}/member/signin`;
      const res = await axios.post<SignInResponse>(url, { username: u, password: p });
      localStorage.setItem('token', res.data.token ?? '');
      if (remember) localStorage.setItem('remember_username', u);
      await Swal.fire({ title: 'สำเร็จ', text: 'ลงชื่อเข้าใช้เรียบร้อย', icon: 'success', timer: 1200, showConfirmButton: false });
      router.push('/backoffice/home');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as any)?.message;
        if (status === 401) {
          Swal.fire({ title: 'Login', text: msg || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', icon: 'warning' });
        } else {
          Swal.fire({ title: 'Error', text: msg || err.message, icon: 'error' });
        }
      } else {
        Swal.fire({ title: 'Error', text: String(err), icon: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSignIn();
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/GM.jpg')" }}
    >
      {/* ชั้นมืดและเบลอพื้นหลังให้กลาสเด่นขึ้น */}
      {/* <div className="absolute inset-0 bg-[#0b1224]/60 backdrop-blur-sm" /> */}

      {/* กล่องแก้วแบบใส ขอบเรืองแสงอ่อน ๆ */}
      <div
        className="
          relative z-10 w-[92%] max-w-md
          rounded-3xl p-8 text-center
          bg-white/10 backdrop-blur-xl
          border border-white/30
          shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_30px_80px_-20px_rgba(0,0,0,0.6)]
        "
      >
        <h2 className="mb-4 text-3xl font-semibold tracking-wide text-white">Login</h2>

        {/* Username */}
        <div className="mb-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onKey}
            className="
              w-full h-11 rounded-full
              border border-white/40
              bg-white/10
              px-5 text-white placeholder-white/70
              focus:border-white focus:bg-white/15 focus:outline-none
              transition-all
            "
            placeholder="Username"
            autoComplete="username"
          />
        </div>

        {/* Password + toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKey}
            className="
              w-full h-11 rounded-full
              border border-white/40
              bg-white/10
              pl-5 pr-11 text-white placeholder-white/70
              focus:border-white focus:bg-white/15 focus:outline-none
              transition-all
            "
            placeholder="Password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5">
              {showPassword ? (
                <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" />
              ) : (
                <path d="M3 3l18 18M9.88 9.88A3 3 0 0 1 14.12 14.12M10.73 5.08A9.94 9.94 0 0 1 12 5c7 0 11 7 11 7a18.52 18.52 0 0 1-2.64 3.8M6.1 6.1A18.52 18.52 0 0 0 1 12s4 7 11 7a9.94 9.94 0 0 0 4.92-1.27" />
              )}
            </svg>
          </button>
        </div>

        {/* Remember me (ไม่มี Forgot Password) */}
        <label className="mb-5 flex items-center gap-2 text-left text-white/80">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-white/40 bg-transparent text-white focus:ring-white/60"
          />
          <span className="text-sm">Remember me</span>
        </label>

        {/* ปุ่ม Login สีขาวทรงแคปซูล */}
        <MinimalButton onClick={doSignIn} loading={loading} variant="whitePill" className="mt-1">
          {loading ? 'Logging in…' : 'Login'}
        </MinimalButton>

        {/* Register เป็นสีเด่น */}
        <p className="mt-5 text-sm text-white/80">
          Don&apos;t have an account?{' '}
          <a
            href="/member/signup"
            className="font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
