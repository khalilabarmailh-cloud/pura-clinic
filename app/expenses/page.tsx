'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Receipt, Plus, DollarSign, Calendar, X, Tag, CreditCard, AlignLeft } from 'lucide-react';

interface Expense {
  id: number;
  description: string; // تم التعديل ليطابق Supabase
  amount: number;
  date: string;
  category: string;
  payment_method: string;
  notes: string;
}

export default function Expenses() {
  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newExp, setNewExp] = useState({ 
    description: '', // تم التعديل هنا أيضاً
    amount: '', 
    date: '', 
    category: 'مستهلكات طبية', 
    payment_method: 'كاش', 
    notes: '' 
  });

  useEffect(() => { 
    setMounted(true);
    fetchExpenses(); 
    setNewExp(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (data) setExpenses(data as Expense[]);
  }

  async function addExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // إرسال البيانات باستخدام المفتاح description ليطابق العمود في قاعدة البيانات
    const { error } = await supabase.from('expenses').insert([{ 
      description: newExp.description, 
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      category: newExp.category,
      payment_method: newExp.payment_method,
      notes: newExp.notes
    }]);

    if (!error) {
      alert("تم تسجيل المصروف بنجاح! 🎉");
      setNewExp({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'مستهلكات طبية', payment_method: 'كاش', notes: '' });
      fetchExpenses();
      setIsModalOpen(false);
    } else {
      alert("حدث خطأ في الحفظ: " + error.message);
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-8" dir="rtl">
      
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <h1 className="text-3xl font-black text-[#AB9AF7] flex items-center gap-3">
          <Receipt size={32} /> السجل المالي والمصاريف
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-red-600 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> تسجيل مصروف
        </button>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 text-[11px] font-black border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="p-5">البيان والملاحظات</th>
              <th className="p-5">التصنيف</th>
              <th className="p-5">التاريخ والدفع</th>
              <th className="p-5 text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-gray-900 dark:text-white text-base">{exp.description}</p>
                  {exp.notes && <p className="text-xs text-gray-400 mt-1 font-medium">{exp.notes}</p>}
                </td>
                <td className="p-5">
                  <span className="bg-[#AB9AF7]/10 text-[#AB9AF7] px-3 py-1.5 rounded-lg text-xs font-black">
                    {exp.category}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {exp.date}</span>
                    <span className="flex items-center gap-1 text-[#AB9AF7]"><CreditCard size={12}/> {exp.payment_method}</span>
                  </div>
                </td>
                <td className="p-5 text-left font-black text-lg text-red-500">
                  -{exp.amount} JD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative border border-gray-100 dark:border-slate-800">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute left-6 top-6 p-2 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">إضافة مصروف 💸</h2>
            
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">البيان (الاسم)</label>
                <input 
                  required 
                  className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm" 
                  value={newExp.description} 
                  onChange={e => setNewExp({...newExp, description: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Tag size={12}/> التصنيف</label>
                  <select className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})}>
                    <option>مستهلكات طبية</option><option>فواتير</option><option>رواتب وعمولات</option><option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><CreditCard size={12}/> الدفع</label>
                  <select className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-bold" value={newExp.payment_method} onChange={e => setNewExp({...newExp, payment_method: e.target.value})}>
                    <option>كاش</option><option>بطاقة بنكية</option><option>تحويل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">المبلغ (JD)</label>
                  <input required type="number" step="0.01" className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-left font-black" dir="ltr" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">التاريخ</label>
                  <input required type="date" className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800" value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><AlignLeft size={12}/> ملاحظات</label>
                <textarea className="w-full p-3.5 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm min-h-[80px]" value={newExp.notes} onChange={e => setNewExp({...newExp, notes: e.target.value})} />
              </div>
              
              <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-xl font-black shadow-lg">حفظ واعتماد المصروف</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}