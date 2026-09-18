'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '@/app/config';
import Image from 'next/image';

export default function Dashboard() {
  const [todo, setTodo] = useState(0);
  const [doing, setDoing] = useState(0);
  const [done, setDone] = useState(0);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const fetchCounts = async () => {
    try {
      const url = `${Config.apiUrl}/todo/summary`;
      const res = await axios.get(url, { headers: authHeaders() });
      setTodo(res.data?.todo || 0);
      setDoing(res.data?.doing || 0);
      setDone(res.data?.done || 0);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => { fetchCounts(); }, []);

  const Card = ({
    title, value, color,
  }: { title: string; value: number; color: string }) => (
    <div
      className={`flex-1 border rounded-2xl p-6 text-center shadow-md ${color}
                  transition-all duration-300 hover:scale-105 hover:shadow-lg`}
    >
      <div className="text-gray-700 font-medium mb-2">{title}</div>
      <div className="text-4xl font-bold">{value}</div>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── โซนบน: ขาวมินิมอล ─────────────────────────────── */}
      <section className="bg-white text-gray-800 py-10">
        <div className="w-full max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

          <div className="flex flex-col md:flex-row gap-6">
            <Card title="ยังไม่ทำ" value={todo}
              color="bg-gray-50 border-gray-200 text-gray-900" />
            <Card title="กำลังทำ" value={doing}
              color="bg-pink-50 border-pink-200 text-pink-800" />
            <Card title="ทำแล้ว" value={done}
              color="bg-sky-50 border-sky-200 text-sky-800" />
          </div>

          <div className="mt-8 h-[2px] w-full bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 rounded-full" />
        </div>
      </section>

      {/* ── โซนล่าง: พื้นหลังรูปภาพ ───────────────────────── */}
      <section className="relative flex-1">
        รูปพื้นหลัง (เอาไฟล์ไปใส่ที่ /public/images/.jpg)
        <Image
          src="/images/Red.jpg"
          alt="dashboard background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* overlay บาง ๆ ให้ตาไม่ล้า */}
        {/* <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" /> */}

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          {/* วางกราฟ/สรุปเพิ่มเติมได้ตรงนี้ */}
        </div>
      </section>
    </main>
  );
}
