const DateLib = {
  to_thai: (date_input) => {
    // สร้าง object Date จากค่า input
    const date = new Date(date_input);

    // คืนค่าข้อความวันที่เป็นภาษาไทย
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',   // แสดงปี พ.ศ.
      month: 'long',     // แสดงชื่อเดือนเต็ม เช่น "มกราคม"
      day: 'numeric'     // แสดงวัน
    });
  }
}

// ทำให้ไฟล์นี้สามารถถูก import ได้ในไฟล์อื่น
module.exports = DateLib;
