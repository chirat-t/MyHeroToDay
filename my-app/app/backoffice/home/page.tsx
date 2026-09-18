'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // ส่ง User ไปยังหน้าที่เราต้องการ (Dashboard) ทันทีที่หน้าเว็บโหลด
    router.push('/backoffice/home/dashboard');
  }, [router]);

  // แสดงหน้า Loading ระหว่างรอเปลี่ยนหน้า เพื่อให้ User ประสบการณ์ที่ดี
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#37352f] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">กำลังพากันไปที่ Dashboard...</p>
      </div>
    </div>
  );
}