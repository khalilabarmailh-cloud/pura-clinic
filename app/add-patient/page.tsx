'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, User, Phone, Droplets, AlertCircle, FileText, Activity, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// قائمة الخدمات مقسمة حسب الفئات
const serviceCategories = [
  {
    title: "💆‍♀️ جلسات العناية بالبشرة",
    services: ["هيدروفيشل للوجه", "هيدروفيشل للظهر", "هيدروفيشل لليدين", "تنظيف بشرة عميق (Deep Cleansing Facial)"]
  },
  {
    title: "🌸 جلسات التجديد والنضارة",
    services: ["ديرمابين مع ميزوثيرابي للوجه", "ديرمابين مع ميزوثيرابي لليدين", "ديرمابين للسترتش مارك"]
  },
  {
    title: "✨ علاج التصبغات وآثار الحبوب",
    services: ["تقشير كيميائي (خفيف / متوسط)", "جلسات توحيد لون البشرة", "علاج آثار الحبوب والندبات"]
  },
  {
    title: "💡 جلسات إضافية متطورة",
    services: ["LED Therapy (العلاج الضوئي)", "ماسكات علاجية (كولاجين / هيالورونيك / جولد)", "جلسات ترطيب عميق للبشرة"]
  },
  {
    title: "💋 خدمات التجميل",
    services: ["توريد الشفايف", "عناية وتفتيح الشفايف"]
  },
  {
    title: "🎁 البكجات",
    services: [
      "باكج النضارة: هيدروفيشل + LED + ماسك",
      "باكج التجديد: ديرمابين + ميزوثيرابي",
      "باكج العروس: تنظيف + هيدروفيشل + ماسك فاخر",
      "باكج الجسم: هيدروفيشل الظهر + عناية متكاملة"
    ]
  }
];

export default function AddPatient() {
  const [formData, setFormData] = useState({
    full_name: '', phone: '', skin_type: 'دهنية', allergies: '', medical_history: '', main_concern: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // دالة لاختيار أو إلغاء اختيار الخدمة
  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  async function handleAdd(e: any) {
    e.preventDefault();
    setIsLoading(true);
    
    // دمج الخدمات المختارة مع الملاحظات اليدوية
    const finalConcern = selectedServices.length > 0 
      ? `الخدمات المطلوبة: ${selectedServices.join(' + ')}\n${formData.main_concern ? 'ملاحظات: ' + formData.main_concern : ''}`
      : formData.main_concern;

    const { error } = await supabase.from('patients').insert([
      { ...formData, main_concern: finalConcern, department: 'جلدية وتجميل', visit_count: 0 }
    ]);
    
    if (!error) {
      alert("تم فتح الملف الطبي بنجاح! 🎉");
      // تصفير الحقول بعد الإضافة
      setFormData({ full_name: '', phone: '', skin_type: 'دهنية', allergies: '', medical_history: '', main_concern: '' });
      setSelectedServices([]);
      setExpandedCategory(null);
    } else {
      alert("حدث خطأ أثناء إضافة المريض.");
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 mt-2 sm:mt-4 p-3 sm:p-8 mb-20 lg:mb-0" dir="rtl">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#AB9AF7]/10 text-[#AB9AF7] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
          <User className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-gray-800 dark:text-white">فتح ملف طبي جديد</h1>
        <p className="text-gray-500 font-bold text-xs sm:text-sm">أدخل بيانات المراجع بدقة لضمان جودة الخدمة</p>
      </div>
      
      <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        
        <div className="h-2 w-full bg-gradient-to-l from-[#AB9AF7] to-purple-400"></div>

        <div className="p-4 sm:p-10 space-y-6 sm:space-y-8">
          
          {/* ================= القسم الأول: المعلومات الشخصية ================= */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><User size={18}/> المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <div className="relative">
                <User className="absolute right-3.5 top-3.5 sm:top-4 text-gray-400" size={18} />
                <input required placeholder="الاسم الكامل (رباعي)" className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className="absolute right-3.5 top-3.5 sm:top-4 text-gray-400" size={18} />
                <input required placeholder="رقم الهاتف (07...)" className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          {/* ================= القسم الثاني: المعلومات الطبية ================= */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><Activity size={18}/> السجل الطبي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <div className="relative">
                <Droplets className="absolute right-3.5 top-3.5 sm:top-4 text-[#AB9AF7]" size={18} />
                <select className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all appearance-none" value={formData.skin_type} onChange={e => setFormData({...formData, skin_type: e.target.value})}>
                  <option value="دهنية">بشرة دهنية</option>
                  <option value="جافة">بشرة جافة</option>
                  <option value="مختلطة">بشرة مختلطة</option>
                  <option value="عادية">بشرة عادية</option>
                  <option value="حساسة">بشرة حساسة</option>
                </select>
              </div>
              <div className="relative">
                <AlertCircle className="absolute right-3.5 top-3.5 sm:top-4 text-red-400" size={18} />
                <input placeholder="الحساسية (إن وجدت)" className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-red-300 transition-all placeholder-red-300" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
              </div>
            </div>
          </div>

          {/* ================= القسم الثالث: الخدمات (القائمة المنسدلة الذكية) ================= */}
          <div>
            <h3 className="text-[#AB9AF7] font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><Sparkles size={18}/> الخدمات المطلوبة (اختر من القائمة)</h3>
            
            <div className="space-y-2 mb-4">
              {serviceCategories.map((category, index) => (
                <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden transition-all">
                  {/* زر فتح وإغلاق القائمة */}
                  <button 
                    type="button" 
                    onClick={() => setExpandedCategory(expandedCategory === category.title ? null : category.title)} 
                    className="w-full bg-gray-50 dark:bg-slate-900 p-3 sm:p-4 flex justify-between items-center text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>{category.title}</span>
                    {expandedCategory === category.title ? <ChevronUp size={20} className="text-[#AB9AF7]"/> : <ChevronDown size={20} className="text-gray-400"/>}
                  </button>
                  
                  {/* محتوى القائمة (الخدمات) */}
                  {expandedCategory === category.title && (
                    <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 space-y-2 border-t border-gray-100 dark:border-slate-700">
                      {category.services.map((service, sIndex) => (
                        <label key={sIndex} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-transparent hover:border-[#AB9AF7]/30">
                          <input 
                            type="checkbox" 
                            checked={selectedServices.includes(service)}
                            onChange={() => toggleService(service)}
                            className="w-4.5 h-4.5 text-[#AB9AF7] rounded border-gray-300 focus:ring-[#AB9AF7] bg-white dark:bg-slate-900"
                          />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 select-none">{service}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* عرض الخدمات اللي تم اختيارها عشان الموظفة تتأكد */}
            {selectedServices.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-2">تم اختيار:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((s, idx) => (
                    <span key={idx} className="bg-[#AB9AF7] text-white text-[10px] sm:text-xs px-2 py-1 rounded-lg font-bold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <FileText className="absolute right-3.5 top-3.5 sm:top-4 text-gray-400" size={18} />
                <textarea placeholder="ملاحظات إضافية على الزيارة (اختياري)..." className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all min-h-[60px]" value={formData.main_concern} onChange={e => setFormData({...formData, main_concern: e.target.value})} />
              </div>
              
              <div className="relative">
                <FileText className="absolute right-3.5 top-3.5 sm:top-4 text-gray-400" size={18} />
                <textarea placeholder="التاريخ الطبي الكامل والملاحظات العامة للمريض..." className="w-full p-3.5 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 outline-none focus:border-[#AB9AF7] transition-all min-h-[80px]" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} />
              </div>
            </div>
          </div>

          {/* ================= زر الحفظ ================= */}
          <div className="pt-2 sm:pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-[#AB9AF7] text-white py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl shadow-lg hover:bg-[#9685e8] hover:scale-[1.01] transition-all flex justify-center items-center gap-2 sm:gap-3">
              {isLoading ? <><Loader2 className="animate-spin" size={20} /> جاري بناء الملف...</> : "حفظ الملف وإضافته للسجل"}
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}