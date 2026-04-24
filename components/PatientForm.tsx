'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PatientForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const patientData = {
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      age: formData.get('age'),
      skin_type: formData.get('skinType'),
      medical_history: formData.get('medical_history'),
    };

    const { error } = await supabase.from('patients').insert([patientData]);

    if (error) {
      alert("حدث خطأ أثناء الحفظ");
    } else {
      alert("تم حفظ بيانات المريض بنجاح في النظام! ✨");
      e.target.reset(); // مسح الفورم بعد الحفظ
    }
    setLoading(false);
  }

  return (
    <section className="bg-white border border-[#AB9AF7]/40 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-[#AB9AF7]/20 pb-3 text-right">إستمارة مريض جديد</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8 text-right" dir="rtl">
        <div>
          <h3 className="text-[#AB9AF7] font-semibold mb-4">البيانات الشخصية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="full_name" type="text" placeholder="الاسم الرباعي" required className="p-3 border border-gray-200 rounded-lg focus:border-[#AB9AF7] outline-none" />
            <input name="phone" type="tel" placeholder="رقم الهاتف" required className="p-3 border border-gray-200 rounded-lg focus:border-[#AB9AF7] outline-none" />
            <input name="age" type="number" placeholder="العمر" required className="p-3 border border-gray-200 rounded-lg focus:border-[#AB9AF7] outline-none" />
          </div>
        </div>

        <div>
          <h3 className="text-[#AB9AF7] font-semibold mb-4">نوع البشرة</h3>
          <div className="flex flex-wrap gap-4">
            {['دهنية', 'جافة', 'مختلطة', 'حساسة'].map((type) => (
              <label key={type} className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input type="radio" name="skinType" value={type} className="w-5 h-5 accent-[#AB9AF7]" />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[#AB9AF7] font-semibold mb-4">التاريخ الطبي والملاحظات</h3>
          <textarea name="medical_history" rows={4} placeholder="هل تعاني من حساسية تجاه منتجات معينة؟" className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#AB9AF7] outline-none resize-none"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-[#AB9AF7] text-white rounded-lg font-bold hover:bg-[#9a86f5] transition-colors shadow-md disabled:bg-gray-300"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ بيانات المريض'}
        </button>
      </form>
    </section>
  );
}