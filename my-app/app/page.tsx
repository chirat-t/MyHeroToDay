export default function Home() {
  return (
    <main
      className="relative flex flex-col items-center justify-center h-screen text-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/M.jpg')", //  เปลี่ยนชื่อไฟล์ได้เลย เช่น /mountain.jpg
      }}
    >
      {/* ชั้นโปร่งใสให้ข้อความเด่นขึ้น */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* เนื้อหาด้านหน้า */}
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
          Welcome to My-Hero-Day 👑
        </h1>
        <p className="text-white/90 text-lg mb-8">
          ไปที่เมนู “บันทึกงาน” เพื่อเริ่มใช้งานระบบได้เลย!
        </p>

        <a
          href="/backoffice/home/todo"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-medium shadow-lg hover:brightness-110 transition-all"
        >
          ไปที่หน้าบันทึกงาน
        </a>
      </div>
    </main>
  );
}
