'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, User, Phone, Sparkles } from 'lucide-react';

export default function BookingPage() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', treatment: 'تنظيف بشرة' });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const { error } = await supabase.from('appointments').insert([{
      patient_name: form.name,
      appointment_date: form.date,
      appointment_time: form.time,
      treatment_type: form.treatment,
      status: 'قيد التأكيد', // حالة جديدة للحجز الذاتي
      is_paid: false
    }]);

    if (!error) setSubmitted(true);
    else alert("حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى.");
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">تم استلام طلبك!</h2>
          <p className="text-gray-500 mb-6">شكراً لكِ {form.name}، سنتواصل معكِ قريباً لتأكيد الموعد.</p>
          <button onClick={() => setSubmitted(false)} className="w-full bg-[#AB9AF7] text-white py-3 rounded-xl font-bold">حجز موعد آخر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[#AB9AF7] tracking-tighter mb-2">PURA CLINIC</h1>
        <p className="text-sm text-gray-500 font-bold">نظام الحجز الإلكتروني المباشر</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-gray-100 space-y-5">
        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 flex items-center gap-1"><User size={14}/> الاسم الكامل</label>
          <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#AB9AF7]" placeholder="الاسم كما هو مسجل لدينا..." />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 flex items-center gap-1"><Phone size={14}/> رقم الهاتف</label>
          <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#AB9AF7]" placeholder="07xxxxxxx" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 flex items-center gap-1"><Calendar size={14}/> التاريخ</label>
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#AB9AF7]" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 flex items-center gap-1"><Clock size={14}/> الوقت</label>
            <input type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#AB9AF7]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 mb-2">نوع الجلسة</label>
          <select value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#AB9AF7]">
            <option>تنظيف بشرة عميق</option>
            <option>جلسة ليزر</option>
            <option>تقشير كيميائي</option>
            <option>استشارة مجانية</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-[#AB9AF7] text-white py-4 rounded-xl font-black text-lg hover:bg-[#9685e8] transition-colors shadow-lg shadow-[#AB9AF7]/30 mt-4">
          تأكيد طلب الحجز
        </button>
      </form>
    </div>
  );
}