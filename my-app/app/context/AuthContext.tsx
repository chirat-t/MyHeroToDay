'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Config } from '../config';

type Member = {
  name: string;
  username: string;
  avatar: string | null;
};

type AuthContextValue = {
  member: Member;
  avatarSrc: string | null;
  refresh: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Single source of truth for the "am I logged in" check. Mounted once at the
// top of the protected area (backoffice/home/layout.tsx) so every page below
// it only ever renders once a valid session is confirmed — no more per-page
// token checks that let page content flash before the redirect fires.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  const fetchMember = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/member/signin');
      return;
    }
    try {
      const res = await axios.get(`${Config.apiUrl}/member/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMember({
        name: res.data?.name ?? '',
        username: res.data?.username ?? '',
        avatar: res.data?.avatar ?? null,
      });
    } catch {
      localStorage.removeItem('token');
      router.replace('/member/signin');
    } finally {
      setChecked(true);
    }
  }, [router]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const signOut = () => {
    localStorage.removeItem('token');
    setMember(null);
    router.replace('/member/signin');
  };

  if (!checked || !member) {
    return (
      <div className="min-h-screen grid place-items-center bg-white text-gray-400">
        <div className="animate-pulse text-sm">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // avatar เก็บเป็น URL เต็มจาก Cloudinary อยู่แล้ว ใช้ได้ตรงๆ ไม่ต้องต่อกับ Config.apiUrl
  const avatarSrc = member.avatar || null;

  return (
    <AuthContext.Provider value={{ member, avatarSrc, refresh: fetchMember, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
