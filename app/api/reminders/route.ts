import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function sendWhatsAppMessage(phone: string, message: string) {
  console.log('-----------------------------------');
  console.log(`🚀 [جاري الإرسال للرقم ${phone}]:`);
  console.log(message);
  console.log('-----------------------------------');
  return true; 
}

export async function GET() {
  console.log("🔍 بدء عملية فحص التذكيرات اليومية...");

  // طريقة أفضل لحساب تاريخ الغد حسب التوقيت المحلي
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // نأخذ التاريخ بصيغة YYYY-MM-DD بشكل يضمن عدم تدخل فرق التوقيت
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${year}-${month}-${day}`;

  console.log(`📅 السيرفر يبحث عن مواعيد في تاريخ: ${tomorrowStr}`);

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', tomorrowStr)
    .eq('reminder_sent', false)
    .neq('status', 'ملغي');

  if (error) {
    console.error("❌ خطأ في قاعدة البيانات:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  console.log(`📊 وجد السيرفر ${appointments?.length || 0} مواعيد تطابق الشروط.`);

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ message: `لا يوجد مواعيد لتاريخ ${tomorrowStr} تحتاج تذكير.` });
  }

  let sentCount = 0;

  for (const apt of appointments) {
    const message = `مرحباً ${apt.patient_name} 🌸،\nنود تذكيرك بموعدك غداً الساعة ${apt.appointment_time} في عيادة *Pura Maria Clinic*.\nنحن بانتظارك لنهتم بجمالك! ✨\n📍 موقع العيادة: [رابط خرائط جوجل]`;
    
    const isSent = await sendWhatsAppMessage("+96200000000", message);

    if (isSent) {
      await supabase
        .from('appointments')
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq('id', apt.id);
      sentCount++;
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: `تم الانتهاء بنجاح! تم إرسال ${sentCount} رسائل تذكير.` 
  });
}