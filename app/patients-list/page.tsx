'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, Edit3, Save, Activity, FileText, Calendar, Clock, Droplets, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// قائمة الخدمات لتوحيد الشكل مع الإضافة
const serviceCategories = [
  { title: "💆‍♀️ العناية بالبشرة", services: ["هيدروفيشل للوجه", "هيدروفيشل للظهر", "هيدروفيشل لليدين", "تنظيف بشرة عميق"] },
  { title: "🌸 التجديد والنضارة", services: ["ديرمابين + ميزوثيرابي للوجه", "ديرمابين + ميزوثيرابي لليدين", "ديرمابين للسترتش مارك"] },
  { title: "✨ التصبغات وآثار الحبوب", services: ["تقشير كيميائي", "توحيد لون البشرة", "علاج آثار الحبوب والندبات"] },
  { title: "💡 جلسات متطورة", services: ["LED Therapy", "ماسكات علاجية", "ترطيب عميق"] },
  { title: "💋 التجميل", services: ["توريد الشفايف", "عناية وتفتيح الشفايف"] },
  { title: "🎁 البكجات", services: ["باكج النضارة", "باكج التجديد", "باكج العروس", "باكج الجسم"] }
];

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // حالات الخدمات أثناء التعديل
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: pData } = await supabase.from('patients').select('*').order('full_name', { ascending: true });
    
    // جلب المواعيد القادمة فقط
    const today = new Date().toISOString().split('T')[0];
    const { data: aData } = await supabase.from('appointments')
      .select('patient_name, appointment_date, appointment_time, treatment_type')
      .eq('status', 'مجدول')
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (pData) setPatients(pData);
    if (aData) setUpcomingAppointments(aData);
  }

  const getNextAppointment = (patientName: string) => {
    const apt = upcomingAppointments.find(a => a.patient_name === patientName);
    return apt ? { date: apt.appointment_date, time: apt.appointment_time, type: apt.treatment_type } : null;
  };

  const handleEditClick = () => {
    setEditData({ ...selectedPatient });
    setSelectedServices([]); // تصفير الخدمات عند فتح التعديل
    setExpandedCategory(null);
    setIsEditing(true);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  async function handleUpdate() {
    setIsSaving(true);
    
    // دمج الخدمات الجديدة مع الشكوى الأصلية في حال تم اختيار خدمات جديدة
    let finalData = { ...editData };
    if (selectedServices.length > 0) {
      finalData.main_concern = `الخدمات المضافة: ${selectedServices.join(' + ')}\n${editData.main_concern ? 'ملاحظات: ' + editData.main_concern : ''}`;
    }

    const { error } = await supabase.from('patients').update(finalData).eq('id', selectedPatient.id);
    
    if (!error) {
      setSelectedPatient(finalData);
      setIsEditing(false);
      fetchData(); // تحديث البيانات
      alert("تم تحديث بيانات المراجع بنجاح! ✅");
    } else {
      alert("حدث خطأ أثناء التحديث.");
    }
    setIsSaving(false);
  }

  const filtered = patients.filter(p => 
    p.full_name?.includes(searchQuery) || p.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 pb-24" dir="rtl">
      
      {/* الترويسة والبحث */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-slate-800/30 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h1 className="text-2xl sm:text-3xl font-black text-[#AB9AF7]">سجل المراجعين 📁</h1>
        <div className="relative w-full md:w-96">
          <input 
            type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#AB9AF7] transition-all shadow-sm"
          />
          <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* الجدول الأصلي */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                <th className="p-4 text-xs font-black text-gray-400 w-12 text-center">#</th>
                <th className="p-4 text-xs font-black text-gray-400">اسم المراجع</th>
                <th className="p-4 text-xs font-black text-gray-400">رقم الهاتف</th>
                <th className="p-4 text-xs font-black text-gray-400">آخر زيارة</th>
                <th className="p-4 text-xs font-black text-gray-400 text-center">الزيارات</th>
                <th className="p-4 text-xs font-black text-gray-400 text-center">النقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {filtered.map((p, index) => (
                <tr key={p.id} onClick={() => { setSelectedPatient(p); setIsEditing(false); }} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <td className="p-4 text-sm font-bold text-gray-400 text-center">{index + 1}</td>
                  <td className="p-4 text-sm font-black text-gray-800 dark:text-gray-100 group-hover:text-[#AB9AF7]">{p.full_name}</td>
                  <td className="p-4 text-sm font-bold text-gray-600 dark:text-gray-300" dir="ltr">{p.phone}</td>
                  <td className="p-4 text-sm font-bold text-gray-500">{p.last_visit ? new Date(p.last_visit).toLocaleDateString('ar-EG') : 'جديد'}</td>
                  <td className="p-4 text-sm font-black text-[#AB9AF7] text-center">{p.visit_count || 0}</td>
                  <td className="p-4 text-sm font-black text-yellow-500 text-center">{p.loyalty_points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* النافذة المنبثقة (Modal) مع التصميم المدمج */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* الهيدر */}
            <div className="bg-[#AB9AF7] p-5 sm:p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-lg sm:text-xl">
                  {selectedPatient.full_name[0]}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">{selectedPatient.full_name}</h2>
                  <p className="text-white/80 text-xs mt-0.5" dir="ltr">{selectedPatient.phone}</p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                {!isEditing ? (
                  <button onClick={handleEditClick} className="bg-white/20 hover:bg-white/30 p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold">
                    <Edit3 size={16} /> تعديل
                  </button>
                ) : (
                  <button onClick={handleUpdate} disabled={isSaving} className="bg-green-500 hover:bg-green-600 p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold shadow-lg">
                    <Save size={16} /> {isSaving ? 'يُحفظ...' : 'حفظ'}
                  </button>
                )}
                <button onClick={() => setSelectedPatient(null)} className="bg-white/10 hover:bg-white/20 p-2 sm:p-2.5 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* محتوى النافذة المنبثقة */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {isEditing ? (
                /* ---------------- واجهة التعديل المحدثة ---------------- */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">اسم المراجع</label>
                      <input className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] text-sm" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">رقم الهاتف</label>
                      <input className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] text-sm" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">نوع البشرة</label>
                      <select className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] text-sm" value={editData.skin_type} onChange={e => setEditData({...editData, skin_type: e.target.value})}><option>دهنية</option><option>جافة</option><option>مختلطة</option><option>عادية</option></select>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-red-400 px-1">الحساسية والأمراض</label>
                      <input placeholder="لا يوجد" className="w-full p-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 outline-none focus:border-red-400 text-sm" value={editData.allergies || ''} onChange={e => setEditData({...editData, allergies: e.target.value})} />
                    </div>
                  </div>

                  {/* إضافة الخدمات بنظام القوائم المنسدلة (Accordion) */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-[#AB9AF7] px-1 mb-2 flex items-center gap-1.5"><Sparkles size={14}/> إضافة خدمات جديدة للملف</label>
                    <div className="space-y-2 mb-2 max-h-48 overflow-y-auto pr-1">
                      {serviceCategories.map((category, index) => (
                        <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-slate-900/50">
                          <button type="button" onClick={() => setExpandedCategory(expandedCategory === category.title ? null : category.title)} className="w-full p-2.5 flex justify-between items-center text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            <span>{category.title}</span>
                            {expandedCategory === category.title ? <ChevronUp size={16} className="text-[#AB9AF7]"/> : <ChevronDown size={16} className="text-gray-400"/>}
                          </button>
                          {expandedCategory === category.title && (
                            <div className="p-2 bg-white dark:bg-slate-800 space-y-1.5 border-t border-gray-100 dark:border-slate-700">
                              {category.services.map((service, sIndex) => (
                                <label key={sIndex} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 cursor-pointer">
                                  <input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggleService(service)} className="w-3.5 h-3.5 text-[#AB9AF7] rounded focus:ring-[#AB9AF7]"/>
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">{service}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl flex flex-wrap gap-1.5 mb-4">
                        {selectedServices.map((s, idx) => (<span key={idx} className="bg-[#AB9AF7] text-white text-[9px] px-2 py-1 rounded font-bold">{s}</span>))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">الشكوى والملاحظات (النص الحالي)</label>
                    <textarea className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] min-h-[80px] text-sm" value={editData.main_concern} onChange={e => setEditData({...editData, main_concern: e.target.value})} />
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">التاريخ الطبي</label>
                    <textarea className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] min-h-[60px] text-sm" value={editData.medical_history || ''} onChange={e => setEditData({...editData, medical_history: e.target.value})} />
                  </div>
                </div>
              ) : (
                /* ---------------- واجهة العرض المحدثة ---------------- */
                <div className="space-y-6">
                  
                  {/* شبكة الإحصائيات (4 خانات) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-[#AB9AF7]/5 p-3 rounded-2xl border border-[#AB9AF7]/10 text-center">
                      <p className="text-[10px] text-gray-400 font-bold mb-1 flex justify-center items-center gap-1"><Activity size={12}/> الزيارات</p>
                      <p className="text-lg sm:text-xl font-black text-[#AB9AF7]">{selectedPatient.visit_count || 0}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 text-center">
                      <p className="text-[10px] text-yellow-600 font-bold mb-1">النقاط</p>
                      <p className="text-lg sm:text-xl font-black text-yellow-600">{selectedPatient.loyalty_points || 0}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-2xl border border-green-100 dark:border-green-900/30 text-center">
                      <p className="text-[10px] text-green-600 font-bold mb-1 flex justify-center items-center gap-1"><Clock size={12}/> آخر زيارة</p>
                      <p className="text-[11px] sm:text-sm font-black text-green-600 mt-1">{selectedPatient.last_visit || 'جديد'}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center">
                      <p className="text-[10px] text-orange-600 font-bold mb-1 flex justify-center items-center gap-1"><Calendar size={12}/> الموعد القادم</p>
                      {getNextAppointment(selectedPatient.full_name) ? (
                        <div className="mt-1">
                          <p className="text-[11px] font-black text-orange-600 leading-tight">{getNextAppointment(selectedPatient.full_name)?.date}</p>
                          <p className="text-[9px] font-bold text-orange-400">{getNextAppointment(selectedPatient.full_name)?.time}</p>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-black text-gray-400 mt-1">غير محدد</p>
                      )}
                    </div>
                  </div>

                  {/* المعلومات الطبية */}
                  <div className="flex flex-wrap gap-4 px-1">
                    <div className="flex gap-2 items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                      <Droplets size={16} className="text-[#AB9AF7]" />
                      <span className="font-bold">البشرة:</span> {selectedPatient.skin_type || 'غير محدد'}
                    </div>
                    {selectedPatient.allergies && (
                      <div className="flex gap-2 items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30">
                        <AlertTriangle size={16} />
                        <span className="font-bold">حساسية:</span> {selectedPatient.allergies}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-[#AB9AF7] font-bold flex items-center gap-1.5 mb-2"><Activity size={14} /> الخدمات / الشكوى</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white leading-relaxed whitespace-pre-wrap">{selectedPatient.main_concern || 'لا توجد بيانات'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-[#AB9AF7] font-bold flex items-center gap-1.5 mb-2"><FileText size={14} /> التاريخ الطبي الكامل</p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedPatient.medical_history || '-'}</p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}