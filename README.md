# 🚀 My Hero Day - Fullstack Todo List Dashboard

โปรเจกต์จัดการภารกิจรายวัน (Todo List) ที่เน้นการสรุปผลผ่าน Dashboard ที่สวยงาม พัฒนาด้วยเทคนิคการเขียนโปรแกรมสมัยใหม่ทั้ง Frontend และ Backend

## ✨ Key Features
- **Dashboard Overview:** สรุปจำนวนงานแยกตามสถานะ (To Do, Doing, Done) ในรูปแบบ Card ที่เข้าใจง่าย
- **Task Management:** ระบบจัดการงาน (CRUD) ที่เชื่อมต่อกับฐานข้อมูลแบบ Real-time
- **User Authentication:** ระบบสมาชิกที่ปลอดภัยด้วย JWT (JSON Web Token)
- **Responsive UI:** หน้าตาเว็บที่รองรับทั้งการใช้งานผ่านคอมพิวเตอร์และมือถือด้วย Tailwind CSS

## 🛠 Tech Stack
### Frontend
- **Next.js 15 (App Router)** - Framework หลักที่เน้นความเร็วและการทำ SEO
- **TypeScript** - เพื่อความแม่นยำในการเขียนโค้ดและลด Bug
- **Tailwind CSS** - สำหรับการออกแบบ UI สไตล์ Modern Glassmorphism
- **Axios & Lucide React** - สำหรับการจัดการ API และไอคอนที่สวยงาม

### Backend
- **Node.js & Express** - Server-side logic ที่เบาและรวดเร็ว
- **Prisma ORM** - ตัวจัดการฐานข้อมูลที่ทันสมัยและปลอดภัย
- **PostgreSQL/MySQL** - ระบบฐานข้อมูลที่มีเสถียรภาพสูง

## 📦 Project Structure
- `/my-app`: ส่วนของหน้าบ้าน (Next.js)
- `/server`: ส่วนของหลังบ้าน (Express API)

## 🚀 Installation & Setup
1. Clone Repository นี้ลงเครื่อง
2. เข้าไปที่ `/server` รัน `npm install` สร้างไฟล์ `.env` และตั้งค่า  (ดูได้จาก `.env.example`)
3. เข้าไปที่ `/my-app` รัน `npm install`
### Run 
- เปิด 2 Terminal
1. เข้าไปที่ `cd server` รัน `node server.js`  เพื่อเริ่มใช้งาน server
2. เข้าไปที่ `cd my-app` รัน `npm run dev`  เพื่อเริ่มใช้งาน website

### 🖥️ Application Preview
<img width="945" height="857" alt="image" src="https://github.com/user-attachments/assets/eec43274-8f38-47c0-bf07-a92286d87074" />
<img width="942" height="854" alt="image" src="https://github.com/user-attachments/assets/e2d36173-bee8-4e15-9e1f-a41b0ce99015" />
<img width="942" height="850" alt="image" src="https://github.com/user-attachments/assets/a780358a-67ad-4ba0-ae32-f67aa4da8a94" />
<img width="1358" height="939" alt="image" src="https://github.com/user-attachments/assets/57dff37f-3bb4-4284-bf87-e5862b5229d4" />
<img width="1359" height="936" alt="image" src="https://github.com/user-attachments/assets/d27f2faa-b50d-4f80-9c78-6cfe6a542aa8" />
<img width="1353" height="937" alt="image" src="https://github.com/user-attachments/assets/8c7254a6-0b62-454f-98bd-b1d1520f9050" />
