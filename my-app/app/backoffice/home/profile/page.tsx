'use client';

import { useRef, useState, memo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Config } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

/* ---------- Components (ประกาศนอก Profile เพื่อลด re-render) ---------- */
const Label = memo(function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>;
});

const Input = memo(function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5
                  outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400
                  text-slate-800 placeholder-slate-400 ${props.className || ''}`}
    />
  );
});
/* ---------------------------------------------------------------------- */

export default function Profile() {
  const { member, avatarSrc, refresh } = useAuth();

  const [name, setName] = useState(member.name);
  const [username, setUsername] = useState(member.username);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // เคลียร์ input เพื่อให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ title: 'ไฟล์ไม่ถูกต้อง', text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น', icon: 'warning' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({ title: 'ไฟล์ใหญ่เกินไป', text: 'ขนาดไฟล์ต้องไม่เกิน 3MB', icon: 'warning' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await axios.post(`${Config.apiUrl}/member/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
      Swal.fire({ title: 'เปลี่ยนรูปโปรไฟล์สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        title: 'อัพโหลดไม่สำเร็จ',
        text: axios.isAxiosError(err) ? (err.response?.data as any)?.error ?? err.message : String(err),
        icon: 'error',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      if (password && password !== confirmPassword) {
        throw new Error('โปรดป้อนรหัสผ่านให้ตรงกัน');
      }
      const token = localStorage.getItem('token');
      if (!token) return;

      setSaving(true);
      const payload: Record<string, string> = {
        name: name.trim(),
        username: username.trim(),
      };
      if (password.trim() !== '') payload.password = password.trim();

      const url = `${Config.apiUrl}/member/update`;
      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPassword('');
      setConfirmPassword('');
      await refresh();
      Swal.fire({
        title: 'บันทึกสำเร็จ',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: (err as Error).message,
        icon: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50/60">
            <div className="relative h-16 w-16 shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-500 text-white grid place-items-center font-semibold text-lg">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{name ? name.trim().split(' ').map(w => w[0]?.toUpperCase()).slice(0,2).join('') : 'U'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-sky-600 text-white text-xs grid place-items-center shadow-sm hover:bg-sky-700 disabled:opacity-60"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                {uploadingAvatar ? '…' : '📷'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900 truncate">Profile Settings</div>
              <div className="text-sm text-slate-500 truncate">{username || '—'}</div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* ข้อมูลบัญชี */}
            <div>
              <div className="text-sm font-semibold text-slate-800 mb-3">ข้อมูลบัญชี</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ชื่อ</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อ"
                  />
                </div>
                <div>
                  <Label>ชื่อผู้ใช้ (Username)</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                * แก้ไขชื่อผู้ใช้ได้ แต่ควรใช้ตัวอักษรอังกฤษ/ตัวเลขเพื่อหลีกเลี่ยงปัญหาการเข้าสู่ระบบ
              </p>
            </div>

            <hr className="border-slate-200" />

            {/* เปลี่ยนรหัสผ่าน */}
            <div>
              <div className="text-sm font-semibold text-slate-800 mb-3">เปลี่ยนรหัสผ่าน</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>รหัสผ่านใหม่</Label>
                  <div className="relative">
                    <Input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ไม่กรอก = ไม่เปลี่ยนรหัสผ่าน"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute inset-y-0 right-2 px-2 text-slate-400 hover:text-slate-600"
                      title={showPwd ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                    </button>
                  </div>
                </div>
                <div>
                  <Label>ยืนยันรหัสผ่านใหม่</Label>
                  <div className="relative">
                    <Input
                      type={showPwd2 ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd2(!showPwd2)}
                      className="absolute inset-y-0 right-2 px-2 text-slate-400 hover:text-slate-600"
                      title={showPwd2 ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                * เพื่อความปลอดภัย แนะนำรหัสผ่านอย่างน้อย 8 ตัวอักษร และผสม ตัวพิมพ์ใหญ่/เล็ก/ตัวเลข
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5
                           shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
