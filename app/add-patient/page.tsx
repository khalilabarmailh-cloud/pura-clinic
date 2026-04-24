'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Save, Phone, User, Activity, AlertCircle, Sparkles, Loader2, Building2 } from 'lucide-react';

export default function AddPatient() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '', 
    department: 'جلدية وتجميل', // القسم الافتراضي
    skin_type: 'دهنية',
    allergies: '',
    medical_history: '',
    main_concern: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd(e: any) {
    e.preventDefault(); 
    setIsLoading(true);

    const { error } = await supabase.from('patients').insert([formData]);
    
    if (!error) {
      alert(`تم تسجيل الملف في قسم ${formData.department} بنجاح! 🎉`);
      setFormData({ full_name: '', phone: '', department: formData.department, skin_type: 'دهنية', allergies: '', medical_history: '', main_concern: '' });
    } else {
      alert("حدث خطأ أثناء التسجيل. تأكد من إضافة عمود department في Supabase.");
    }
    
    setIsLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4" dir="rtl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-[#AB9AF7]">فتح ملف طبي معزول</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">سيتم ربط هذا الملف بالقسم المختار فقط</p>
      </div>
      
      <form onSubmit={handleAdd} className="glass-card p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-8">
        
        {/* اختيار القسم (هذا اللي بيعزل الملفات عن بعض) */}
        <div className="p-5 bg-[#AB9AF7]/10 border border-[#AB9AF7]/20 rounded-2xl mb-6">
          <label className="text-sm font-black text-[#AB9AF7] flex items-center gap-2 mb-3">
            <Building2 size={18} /> القسم المختص (العيادة)
          </label>
          <div className="flex gap-4">
            {['جلدية وتجميل', 'طب الأسنان', 'الطب العام'].map(dept => (
              <label key={dept} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="department" 
                  checked={formData.department === dept} 
                  onChange={() => setFormData({...formData, department: dept})} 
                  className="accent-[#AB9AF7] w-4 h-4"
                />
                <span className="font-bold text-gray-700 dark:text-gray-300">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><User size={16} className="text-[#AB9AF7]" /> اسم المراجع</label>
            <input required placeholder="الاسم الكامل..." className="w-full p-4 rounded-2xl border dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-[#AB9AF7]" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Phone size={16} className="text-[#AB9AF7]" /> رقم الهاتف</label>
            <input required placeholder="07XXXXXXXX" className="w-full p-4 rounded-2xl border dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-[#AB9AF7]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>

        {/* باقي التفاصيل الطبية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Sparkles size={16} className="text-[#AB9AF7]" /> نوع البشرة / طبيعة الحالة</label>
            <select className="w-full p-4 rounded-2xl border dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 outline-none" value={formData.skin_type} onChange={e => setFormData({...formData, skin_type: e.target.value})}>
              <option>دهنية</option><option>جافة</option><option>مختلطة</option><option>عادية</option><option>حساسة</option><option>لا ينطبق (أسنان/عام)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><AlertCircle size={16} className="text-red-400" /> حساسية دوائية</label>
            <input placeholder="لا يوجد..." className="w-full p-4 rounded-2xl border dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 outline-none" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Activity size={16} className="text-[#AB9AF7]" /> التاريخ الطبي / أمراض مزمنة</label>
          <textarea placeholder="أي ملاحظات طبية مهمة (سكري، ضغط، الخ)..." className="w-full p-4 rounded-2xl border dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 outline-none min-h-[100px]" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} />
        </div>

        <button type="submit" disabled={isLoading} className={`w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${isLoading ? 'bg-gray-400' : 'bg-[#AB9AF7] hover:bg-[#9b88ed]'}`}>
          {isLoading ? <><Loader2 className="animate-spin" size={24} /> جاري الحفظ...</> : <><Save size={24} /> حفظ الملف الطبي بالقسم المختار</>}
        </button>
      </form>
    </div>
  );
}