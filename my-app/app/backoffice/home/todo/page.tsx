'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Config } from '@/app/config';

type Todo = {
  id: number;
  name: string;
  remark?: string;
  status: 'todo' | 'doing' | 'done';
};

export default function TodoPage() {
  // ------ badge สถานะ (พาสเทล + อีโมจิ) ------
  const renderStatus = (s: 'todo'|'doing'|'done') => {
    const map = {
      todo:  { label: 'ยังไม่ทำ', emoji:'🌱', cls: 'bg-gray-100 text-gray-700 border border-gray-200' },
      doing: { label: 'กำลังทำ', emoji:'⏳', cls: 'bg-pink-100 text-pink-800 border border-pink-200' },
      done:  { label: 'ทำแล้ว',  emoji:'✅', cls: 'bg-sky-100 text-sky-800 border border-sky-200' },
    } as const;
    const it = map[s] ?? map.todo;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${it.cls}`}>
        <span>{it.emoji}</span> {it.label}
      </span>
    );
  };

  // ------ states ------
  const [name, setName] = useState('');
  const [remark, setRemark] = useState('');
  const [id, setId] = useState<number>(0); // 0=เพิ่มใหม่, >0=แก้ไข
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  // ตัวกรองสถานะ (all/todo/doing/done)
  const [filter, setFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------- Helpers --------------------
  const authHeaders = () => {
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem('token') || '' : '';
    return { Authorization: `Bearer ${token}` };
  };

  const resetForm = () => {
    setId(0);
    setName('');
    setRemark('');
    setStatus('todo');
  };

  // -------------------- API Calls --------------------
  // GET /todo/list
  const fetchData = async () => {
    try {
      const url = `${Config.apiUrl}/todo/list`;
      const res = await axios.get(url, { headers: authHeaders() });

      const list: Todo[] =
        res.data?.data?.map((x: any) => ({
          id: x.id,
          name: x.name,
          remark: x.remark ?? '',
          status: x.status as 'todo'|'doing'|'done',
        })) ?? [];

      // เรียงจากเก่าไปใหม่ เพื่อให้เลขลำดับที่แสดง (งานที่ 1, 2, 3, ...) คงที่ตามตำแหน่ง
      // ไม่ใช่ตาม id ในฐานข้อมูล — ถ้าลบงานกลางๆ แล้วเพิ่มใหม่ เลขจะไม่มีช่องว่าง
      list.sort((a, b) => a.id - b.id);

      setTodos(list);
    } catch (err: any) {
      console.log('FETCH ERROR:', {
        url: err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      Swal.fire({
        title: 'error',
        text: err?.response?.data?.error ?? err?.message ?? 'โหลดข้อมูลไม่สำเร็จ',
        icon: 'error',
      });
      setTodos([]);
    }
  };

  // POST /todo
  const handleSave = async () => {
    const url = `${Config.apiUrl}/todo`;
    const payload = { name, remark };
    await axios.post(url, payload, { headers: authHeaders() });
  };

  // PUT /todo/:id
  const handleUpdate = async () => {
    const url = `${Config.apiUrl}/todo/${id}`;
    const payload = { name, remark, status };
    await axios.put(url, payload, { headers: authHeaders() });
  };

  // DELETE /todo/:id
  const handleDelete = async (deleteId: number) => {
    const result = await Swal.fire({
      title: 'ลบรายการ?',
      text: 'คุณต้องการลบรายการนี้ใช่หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!result.isConfirmed) return;

    const url = `${Config.apiUrl}/todo/${deleteId}`;
    await axios.delete(url, { headers: authHeaders() });

    Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1000, showConfirmButton: false });
    fetchData();
  };

  // -------------------- Edit / Submit --------------------
  const handleEdit = (todo: Todo) => {
    setId(todo.id);
    setName(todo.name);
    setRemark(todo.remark ?? '');
    setStatus(todo.status);
    window?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อสิ่งที่ต้องทำ' });
      return;
    }

    setLoading(true);
    try {
      if (id === 0) {
        await handleSave();
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1000, showConfirmButton: false });
      } else {
        await handleUpdate();
        Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ', timer: 1000, showConfirmButton: false });
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      console.log('MUTATE ERROR:', {
        url: err?.config?.url,
        method: err?.config?.method,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      Swal.fire({
        title: 'error',
        text: err?.response?.data?.error ?? err?.message ?? 'เกิดข้อผิดพลาด',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Filter / UI --------------------
  const displayedTodos =
    filter === 'all' ? todos : todos.filter((t) => t.status === filter);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50/50 py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">บันทึกรายการ</h2>
          {id !== 0 && (
            <span className="text-xs text-gray-500">
              กำลังแก้ไขรายการ <span className="font-medium">#{id}</span>
            </span>
          )}
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อสิ่งที่ต้องทำ
              </label>
              <input
                className="input w-full rounded-xl border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="สิ่งที่ต้องทำ (เช่น อ่านบทที่ 3)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุ
              </label>
              <input
                className="input w-full rounded-xl border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            {id !== 0 && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  className="input w-full rounded-xl border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'todo'|'doing'|'done')}
                >
                  <option value="todo">ยังไม่ทำ</option>
                  <option value="doing">กำลังทำ</option>
                  <option value="done">ทำแล้ว</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-600 px-6 py-2.5 text-white font-medium shadow-sm hover:bg-sky-700 active:scale-[.98] transition disabled:opacity-60"
            >
              {loading ? (id === 0 ? 'Saving…' : 'Updating…') : id === 0 ? 'Save' : 'Update'}
            </button>
            {id !== 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b bg-gray-50">
            <div className="font-semibold text-gray-700">รายการที่บันทึกไว้</div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 shrink-0">สถานะ</label>
              <select
                className="input w-full sm:w-auto rounded-xl border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all'|'todo'|'doing'|'done')}
              >
                <option value="all">ทุกสถานะ</option>
                <option value="todo">ยังไม่ทำ</option>
                <option value="doing">กำลังทำ</option>
                <option value="done">ทำแล้ว</option>
              </select>
            </div>
          </div>

          {/* Empty states (ใช้ร่วมกันทั้ง mobile และ desktop) */}
          {todos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex flex-col items-center gap-1 text-gray-500">
                <span className="text-2xl">🍃</span>
                <span>ยังไม่มีรายการ—เริ่มเพิ่มรายการแรกกันเลย!</span>
              </div>
            </div>
          ) : displayedTodos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex flex-col items-center gap-1 text-gray-500">
                <span className="text-2xl">🔎</span>
                <span>ไม่พบรายการตามตัวกรอง</span>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: การ์ดแนวตั้ง อ่านง่ายกว่าตารางบนจอแคบ */}
              <div className="md:hidden divide-y divide-gray-100">
                {displayedTodos.map((item, idx) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-400">งานที่ {idx + 1}</div>
                        <div className="font-medium text-gray-800 break-words">{item.name}</div>
                        {item.remark && (
                          <div className="text-sm text-gray-500 break-words mt-0.5">{item.remark}</div>
                        )}
                      </div>
                      <div className="shrink-0">{renderStatus(item.status)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-3 py-2 rounded-full bg-emerald-500 text-white text-xs font-medium shadow-sm hover:bg-emerald-600"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-3 py-2 rounded-full bg-rose-500 text-white text-xs font-medium shadow-sm hover:bg-rose-600"
                      >
                        ❌ ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop/Tablet: ตารางเดิม */}
              <div className="hidden md:block px-6 py-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="text-start p-3 w-[100px]">ลำดับ</th>
                      <th className="text-start p-3">ชื่อสิ่งที่ต้องทำ</th>
                      <th className="text-start p-3">หมายเหตุ</th>
                      <th className="text-center p-3 w-[160px]">สถานะ</th>
                      <th className="text-center p-3 w-[200px]">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTodos.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`border-t ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                        }`}
                      >
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.remark}</td>
                        <td className="text-center p-3">{renderStatus(item.status)}</td>
                        <td className="text-center p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs shadow-sm hover:bg-emerald-600"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs shadow-sm hover:bg-rose-600"
                            >
                              ❌ ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
