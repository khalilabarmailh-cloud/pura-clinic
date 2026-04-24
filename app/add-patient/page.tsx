'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, User, Phone, Droplets, AlertCircle, FileText, Activity } from 'lucide-react';

export default function AddPatient() {
  const [formData, setFormData] = useState({
    full_name: '', phone: '', skin_type: 'دهنية', allergies: '', medical_history: '', main_concern: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd(e: any) {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.from('patients').insert([
      { ...formData, department: 'جلدية وتجميل' }
    ]);
    
    if (!error) {
      alert("تم فتح الملف الطبي بنجاح! 🎉");
      setFormData({ full_name: '', phone: '', skin_type: 'دهنية', allergies: '', medical_history: '', main_concern: '' });
    } else {
      alert("حدث خطأ أثناء إضافة المريض.");
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4 p-4 sm:p-8" dir="rtl">
      
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-[#AB9AF7]/10 text-[#AB9AF7] rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">فتح ملف طبي جديد</h1>
        <p className="text-gray-500 font-bold text-sm">أدخل بيانات المراجع بدقة لضمان جودة الخدمة</p>
      </div>
      
      <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        
        {/* شريط علوي ملون */}
        <div className="h-2 w-full bg-gradient-to-l from-[#AB9AF7] to-purple-400"></div>

        <div className="p-6 sm:p-10 space-y-8">
          
          {/* القسم الأول: المعلومات الشخصية */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-lg mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><User size={20}/> المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative">
                <User className="absolute right-4 top-4 text-gray-400" size={20} />
                <input required placeholder="الاسم الكامل (رباعي)" className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className="absolute right-4 top-4 text-gray-400" size={20} />
                <input required placeholder="رقم الهاتف (07...)" className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          {/* القسم الثاني: المعلومات الطبية */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-lg mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><Activity size={20}/> السجل الطبي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative">
                <Droplets className="absolute right-4 top-4 text-[#AB9AF7]" size={20} />
                <select className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all appearance-none" value={formData.skin_type} onChange={e => setFormData({...formData, skin_type: e.target.value})}>
                  <option value="دهنية">بشرة دهنية</option>
                  <option value="جافة">بشرة جافة</option>
                  <option value="مختلطة">بشرة مختلطة</option>
                  <option value="عادية">بشرة عادية</option>
                  <option value="حساسة">بشرة حساسة</option>
                </select>
              </div>
              <div className="relative">
                <AlertCircle className="absolute right-4 top-4 text-red-400" size={20} />
                <input placeholder="الحساسية أو الأمراض المزمنة (إن وجدت)" className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-red-300 transition-all placeholder-red-300" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
              </div>
            </div>
          </div>

          {/* القسم الثالث: تفاصيل الزيارة */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-lg mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><FileText size={20}/> تفاصيل الزيارة</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <FileText className="absolute right-4 top-4 text-gray-400" size={20} />
                <textarea placeholder="الشكوى الرئيسية (سبب الزيارة اليوم)..." className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all min-h-[80px]" value={formData.main_concern} onChange={e => setFormData({...formData, main_concern: e.target.value})} />
              </div>
              
              <div className="relative">
                <FileText className="absolute right-4 top-4 text-gray-400" size={20} />
                <textarea placeholder="ملاحظات الطبيب أو أي تفاصيل أخرى تخص الملف..." className="w-full p-4 pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all min-h-[100px]" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} />
              </div>
            </div>
          </div>

          {/* زر الحفظ */}
          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-[#AB9AF7] text-white py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:bg-[#9685e8] hover:scale-[1.01] transition-all flex justify-center items-center gap-3">
              {isLoading ? <><Loader2 className="animate-spin" size={24} /> جاري بناء الملف...</> : "حفظ الملف وإضافته للسجل"}
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}