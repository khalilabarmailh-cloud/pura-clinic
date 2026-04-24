'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ product_name: '', stock: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*').order('product_name');
    if (data) setItems(data);
  }

  async function addItem(e: any) {
    e.preventDefault();
    const { error } = await supabase.from('inventory').insert([{ 
      product_name: newItem.product_name, 
      stock: parseInt(newItem.stock) 
    }]);
    if (!error) {
      setNewItem({ product_name: '', stock: '' });
      fetchInventory();
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <h1 className="text-3xl font-black text-[#AB9AF7] flex items-center gap-3">
        <Package size={32} /> إدارة المخزون
      </h1>

      {/* نموذج إضافة منتج جديد (بتنسيق واسع) */}
      <form onSubmit={addItem} className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row gap-6 items-end shadow-sm">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">اسم المنتج / المادة</label>
          <input 
            required
            placeholder="مثال: إبر ديرمابن، ماسك كولاجين..."
            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#AB9AF7] transition-all"
            value={newItem.product_name}
            onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">الكمية المتوفرة</label>
          <input 
            required type="number"
            placeholder="0"
            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#AB9AF7] transition-all text-center font-black text-lg"
            value={newItem.stock}
            onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
          />
        </div>
        <button className="w-full md:w-auto bg-[#AB9AF7] text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-[#9685e8] transition-all flex items-center justify-center gap-2">
          <Plus size={20} /> إضافة للمخزون
        </button>
      </form>

      {/* جدول المخزون المفرود */}
      <div className="glass-card rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-300 text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-slate-700">
                <th className="p-6">المنتج</th>
                <th className="p-6 text-center">الكمية المتوفرة</th>
                <th className="p-6">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6 font-bold text-gray-900 dark:text-white text-lg">
                    {item.product_name}
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-2xl font-black text-[#AB9AF7] bg-[#AB9AF7]/10 dark:bg-[#AB9AF7]/20 px-4 py-2 rounded-xl inline-block min-w-[3rem]">
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-6">
                    {item.stock <= 5 ? (
                      <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-xl text-sm font-black border border-red-100 dark:border-red-900/50">
                        <AlertTriangle size={16} /> مخزون منخفض
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-xl text-sm font-black border border-green-100 dark:border-green-900/50">
                        <CheckCircle2 size={16} /> متوفر
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-medium">
            لا توجد منتجات في المخزون حالياً.
          </div>
        )}
      </div>
    </div>
  );
}