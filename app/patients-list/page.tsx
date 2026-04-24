'use strict';
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, User, Phone, CalendarCheck, AlertCircle, Droplets, FileText, Star, Edit3, Save, Activity } from 'lucide-react';

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('full_name', { ascending: true });
    if (data) setPatients(data);
  }

  const handleEditClick = () => {
    setEditData({ ...selectedPatient });
    setIsEditing(true);
  };

  async function handleUpdate() {
    setIsSaving(true);
    const { error } = await supabase.from('patients').update(editData).eq('id', selectedPatient.id);
    
    if (!error) {
      setSelectedPatient(editData);
      setIsEditing(false);
      fetchPatients();
      alert("تم تحديث بيانات المراجع بنجاح! ✅");
    } else {
      alert("حدث خطأ أثناء التحديث.");
    }
    setIsSaving(false);
  }

  const filtered = patients.filter(p => 
    p.full_name.includes(searchQuery) || p.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8" dir="rtl">
      
      {/* الترويسة والبحث */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

      {/* الجدول */}
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

      {/* النافذة المنبثقة (Modal) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative">
            
            {/* الهيدر */}
            <div className="bg-[#AB9AF7] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xl">
                  {selectedPatient.full_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black">{selectedPatient.full_name}</h2>
                  <p className="text-white/80 text-xs" dir="ltr">{selectedPatient.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button onClick={handleEditClick} className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold">
                    <Edit3 size={18} /> تعديل
                  </button>
                ) : (
                  <button onClick={handleUpdate} disabled={isSaving} className="bg-green-500 hover:bg-green-600 p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-lg">
                    <Save size={18} /> {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                )}
                <button onClick={() => setSelectedPatient(null)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {isEditing ? (
                /* واجهة التعديل */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">اسم المراجع</label>
                    <input className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7]" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">رقم الهاتف</label>
                    <input className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7]" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 px-1">نوع البشرة</label>
                    <select className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7]" value={editData.skin_type} onChange={e => setEditData({...editData, skin_type: e.target.value})}><option>دهنية</option><option>جافة</option><option>مختلطة</option><option>عادية</option></select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-gray-400 px-1">الشكوى والملاحظات</label>
                    <textarea className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] min-h-[100px]" value={editData.main_concern} onChange={e => setEditData({...editData, main_concern: e.target.value})} />
                  </div>
                </div>
              ) : (
                /* واجهة العرض */
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#AB9AF7]/5 p-4 rounded-2xl border border-[#AB9AF7]/10 text-center">
                      <p className="text-[10px] text-gray-400 font-bold mb-1">إجمالي الزيارات</p>
                      <p className="text-2xl font-black text-[#AB9AF7]">{selectedPatient.visit_count || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
                      <p className="text-[10px] text-yellow-600 font-bold mb-1">نقاط الولاء</p>
                      <p className="text-2xl font-black text-yellow-600">{selectedPatient.loyalty_points || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-center col-span-2 md:col-span-1">
                      <p className="text-[10px] text-gray-400 font-bold mb-1">نوع البشرة</p>
                      <p className="text-lg font-black text-gray-800 dark:text-white">{selectedPatient.skin_type || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-[#AB9AF7] font-bold flex items-center gap-1.5 mb-2"><Activity size={14} /> الشكوى الرئيسية</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white leading-relaxed">{selectedPatient.main_concern || 'لا توجد بيانات'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-[#AB9AF7] font-bold flex items-center gap-1.5 mb-2"><FileText size={14} /> التاريخ الطبي الكامل</p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedPatient.medical_history || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}