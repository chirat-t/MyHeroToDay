'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Config } from '../../config';
import axios from 'axios';

// ปุ่มขาวทรงแคปซูล (สไตล์เดียวกับหน้า Login)
function WhitePillButton({
  children,
  className = '',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'w-full rounded-full px-5 py-2.5 font-semibold',
        'bg-white text-slate-900 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)]',
        'hover:bg-white/95 active:scale-[0.98] transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = name.trim() && username.trim() && password.trim().length >= 6;

  const handleSignUp = async () => {
    if (!isValid) {
      Swal.fire({ icon: 'warning', title: 'Register', text: 'โปรดกรอกข้อมูลให้ครบ และรหัสผ่านอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    try {
      setLoading(true);
      const url = `${Config.apiUrl}/member/signup`;
      const payload = { name, username, password };
      const res = await axios.post(url, payload);

      await Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
      });

      if (res.data?.token) localStorage.setItem('token', res.data.token);
      router.push('/member/signin');
    } catch (err: any) {
      const apiMsg = err?.response?.data?.error || err?.message || 'Something went wrong';
      Swal.fire({ icon: 'error', title: 'สมัครไม่สำเร็จ', text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/GM.jpg')" }}
    >
      {/* ชั้นมืดและเบลอพื้นหลังให้กล่องเด่นขึ้น */}
      <div className="absolute inset-0 bg-[#0b1224]/60 backdrop-blur-sm" />

      {/* การ์ดกลาสใสสไตล์เดียวกับหน้า Login */}
      <div
        className="
          relative z-10 w-[92%] max-w-md
          rounded-3xl p-8 text-center
          bg-white/10 backdrop-blur-xl
          border border-white/30
          shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_30px_80px_-20px_rgba(0,0,0,0.6)]
        "
      >
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-semibold tracking-wide text-white">Register</h1>
          <p className="mt-1 text-sm text-white/70">สมัครสมาชิกเพื่อใช้งานระบบ Todo List</p>
        </div>

        {/* Form */}
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">ชื่อ–นามสกุล</label>
            <input
              className="
                w-full h-11 rounded-full
                border border-white/40 bg-white/10
                px-5 text-white placeholder-white/70
                focus:border-white focus:bg-white/15 focus:outline-none transition-all
              "
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">ชื่อผู้ใช้</label>
            <input
              className="
                w-full h-11 rounded-full
                border border-white/40 bg-white/10
                px-5 text-white placeholder-white/70
                focus:border-white focus:bg-white/15 focus:outline-none transition-all
              "
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="
                  w-full h-11 rounded-full
                  border border-white/40 bg-white/10
                  pl-5 pr-12 text-white placeholder-white/70
                  focus:border-white focus:bg-white/15 focus:outline-none transition-all
                "
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-3 my-1 px-2 rounded-md text-sm text-white/80 hover:text-white"
                aria-label={showPwd ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPwd ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
          </div>
        </div>

        {/* ปุ่มขาวทรงแคปซูล */}
        <div className="mt-6">
          <WhitePillButton onClick={handleSignUp} disabled={!isValid || loading}>
            {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </WhitePillButton>
        </div>

        {/* ลิงก์ไปหน้า Sign In — สีเด่นแบบเดียวกับลิงก์ Register ในหน้า Login */}
        <p className="mt-5 text-sm text-white/80 text-center">
          มีบัญชีอยู่แล้ว?{' '}
          <a
            href="/member/signin"
            className="font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
          >
            เข้าสู่ระบบ
          </a>
        </p>
      </div>

      {/* footer เล็ก ๆ (ตัวหนังสือสีอ่อนให้เข้าชุด) */}
      <p className="absolute bottom-4 w-full text-center text-xs text-white/60">
        โดย <span className="font-medium text-white/80">Chirat Thanasedworakoon ⚡️</span>
      </p>
    </div>
  );
}
