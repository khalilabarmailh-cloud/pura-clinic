'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Building2, Trash2, ShieldAlert } from 'lucide-react';

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userRole, setUserRole] = useState<string | null>('');
  const [userDept, setUserDept] = useState<string | null>('');
  const [activeTab, setActiveTab] = useState('جلدية وتجميل');

  useEffect(() => { 
    const role = localStorage.getItem('user_role');
    const dept = localStorage.getItem('user_dept');
    
    setUserRole(role);
    setUserDept(dept);
    
    if (role === 'doctor' && dept) {
      setActiveTab(dept);
    }
    
    fetchPatients(); 
  }, []);

  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('full_name');
    if (data) setPatients(data);
  }

  async function deletePatient(id: number, name: string) {
    if(confirm(`هل أنت متأكد من حذف المريض ${name} نهائياً؟`)) {
      await supabase.from('patients').delete().eq('id', id);
      fetchPatients();
    }
  }

  const filtered = patients.filter(p => {
    const matchesDept = userRole === 'doctor' 
      ? p.department === userDept 
      : (p.department === activeTab || (!p.department && activeTab === 'جلدية وتجميل'));
      
    const matchesSearch = p.full_name?.includes(searchTerm) || p.phone?.includes(searchTerm);
    return matchesDept && matchesSearch;
  });

  // دالة تغيير الصلاحيات للمحاكاة (حركة المطورين)
  const simulateLogin = (role: string, dept: string = '') => {
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_dept', dept);
    window.location.reload(); // تحديث الصفحة لتطبيق الصلاحية
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* 🔴 أزرار المحاكاة (مؤقتة للتجربة فقط - بتقدر تحذفها بعدين) 🔴 */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-black">
          <ShieldAlert size={24} /> <span>جرب الصلاحيات من هنا:</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => simulateLogin('admin')} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">أنا المدير</button>
          <button onClick={() => simulateLogin('doctor', 'طب الأسنان')} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">طبيب أسنان</button>
          <button onClick={() => simulateLogin('doctor', 'الطب العام')} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">طبيب عام</button>
          <button onClick={() => simulateLogin('receptionist')} className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">موظف الاستقبال</button>
        </div>
      </div>
      {/* ----------------------------------------------------- */}

      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <h1 className="text-3xl font-black text-[#AB9AF7]">سجل المراجعين 📁</h1>
        <div className="relative w-80">
          <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
          <input placeholder="بحث بالاسم أو الرقم..." className="w-full pr-10 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {(userRole === 'admin' || userRole === 'receptionist') && (
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
      )}

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 text-[11px] font-black uppercase border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="p-5">المراجع</th>
              <th className="p-5 text-left">الهاتف</th>
              <th className="p-5 text-center">القسم</th>
              {userRole === 'admin' && <th className="p-5 text-left">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="p-5 font-bold text-gray-800 dark:text-white flex items-center gap-3">
                   <div className="w-8 h-8 bg-[#AB9AF7]/10 rounded-full flex items-center justify-center text-[#AB9AF7]"><User size={16} /></div>
                   {p.full_name}
                </td>
                <td className="p-5 text-left font-medium text-gray-600 dark:text-gray-300" dir="ltr">{p.phone}</td>
                <td className="p-5 text-center">
                  <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-bold">{p.department || 'جلدية وتجميل'}</span>
                </td>
                
                {userRole === 'admin' && (
                  <td className="p-5 text-left">
                    <button onClick={() => deletePatient(p.id, p.full_name)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">لا يوجد مراجعين.</p>}
      </div>
    </div>
  );
}