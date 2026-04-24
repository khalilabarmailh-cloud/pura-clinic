'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Star, Activity, Sparkles, Building2 } from 'lucide-react';

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('جلدية وتجميل'); // القسم الفعال حالياً

  useEffect(() => { fetchPatients(); }, []);

  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('full_name');
    if (data) setPatients(data);
  }

  // فلترة ذكية: حسب القسم المختار + حسب اسم المريض
  const filtered = patients.filter(p => 
    (p.department === activeTab || (!p.department && activeTab === 'جلدية وتجميل')) &&
    (p.full_name?.includes(searchTerm) || p.phone?.includes(searchTerm))
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-[#AB9AF7]">سجل المراجعين المعزول 📁</h1>
        <div className="relative w-80">
          <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
          <input placeholder="بحث بالاسم أو الرقم..." className="w-full pr-10 p-3.5 rounded-2xl border dark:border-slate-700 dark:bg-slate-800 outline-none text-sm" onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* أزرار التنقل بين الأقسام (التبويبات) */}
      <div className="flex gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-gray-100 dark:border-slate-700 w-fit shadow-sm">
        {['جلدية وتجميل', 'طب الأسنان', 'الطب العام'].map(dept => (
          <button 
            key={dept}
            onClick={() => setActiveTab(dept)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === dept ? 'bg-[#AB9AF7] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <Building2 size={16} /> {dept}
          </button>
        ))}
      </div>

      {/* جدول المرضى الخاص بالقسم المختار فقط */}
      <div className="glass-card rounded-[2rem] overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 text-[11px] font-black uppercase border-b border-gray-100 dark:border-slate-700">
            <tr><th className="p-5">المراجع</th><th className="p-5 text-left">الهاتف</th><th className="p-5 text-center">القسم</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-[#AB9AF7]/5 transition-colors group">
                <td className="p-5 font-bold text-gray-800 dark:text-white flex items-center gap-3">
                   <div className="w-8 h-8 bg-[#AB9AF7]/10 rounded-full flex items-center justify-center text-[#AB9AF7]"><User size={16} /></div>
                   {p.full_name}
                </td>
                <td className="p-5 text-left font-medium text-gray-600 dark:text-gray-300" dir="ltr">{p.phone}</td>
                <td className="p-5 text-center">
                  <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-bold">{p.department || 'جلدية وتجميل'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">لا يوجد مراجعين في قسم {activeTab}</p>}
      </div>
    </div>
  );
}