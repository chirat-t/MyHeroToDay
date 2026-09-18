'use client'; // เพิ่มเพื่อให้ใช้การเปิด-ปิดเมนูได้

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthProvider } from "../../context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // สร้าง State สำหรับคุมการเปิด-ปิด Sidebar บนมือถือ
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden relative">
      
      {/* 1. Sidebar: ส่งสถานะไปคุมการเปิด-ปิด */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 2. เนื้อหาหลัก */}
      <div className={`
        transition-all duration-300 
        min-h-screen bg-white
        ml-0 md:ml-[220px]  /* บนมือถือชิดซ้าย (ml-0) | จอคอมขยับหลบ (md:ml-[220px]) */
      `}>
        {/* ส่งฟังก์ชันไปให้ Navbar เพื่อกดปุ่ม Hamburger ได้ */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* 3. Overlay (พื้นหลังดำจางๆ ตอนเปิดเมนูบนมือถือ) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
    </AuthProvider>
  );
}