'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Building2 } from 'lucide-react';

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('جلدية وتجميل');

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('full_name');
    if (data) setPatients(data);
  }

  // فلترة المرضى حسب التبويب المختار
  const filtered = patients.filter(p => p.department === activeTab);

  return (
    <div className="space-y-8" dir="rtl">
      <h1 className="text-3xl font-black text-[#AB9AF7]">سجل المراجعين 📁</h1>
      
      {/* التبويبات للجميع بدون صلاحيات */}
      <div className="flex gap-2 bg-white/50 p-2 rounded-2xl border w-fit">
        {['جلدية وتجميل', 'طب الأسنان', 'الطب العام'].map(dept => (
          <button 
            key={dept} 
            onClick={() => setActiveTab(dept)} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm ${activeTab === dept ? 'bg-[#AB9AF7] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filtered.map(p => (
          <div key={p.id} className="glass-card p-6 rounded-[2rem] shadow-sm border bg-white/50">
            <h3 className="font-black text-xl text-gray-800">{p.full_name}</h3>
            <p className="text-sm font-bold text-gray-500 mb-4">{p.phone}</p>
            <div className="bg-gray-50 p-3 rounded-xl mb-4">
              <p className="text-xs font-bold text-gray-400">الشكوى الرئيسية:</p>
              <p className="text-sm font-bold text-gray-700">{p.main_concern || 'غير محدد'}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-400 font-bold py-10">لا يوجد مراجعين في هذا القسم حالياً.</p>
        )}
      </div>
    </div>
  );
}