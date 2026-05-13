'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, AlertTriangle, Plus, CheckCircle2, Minus, Trash2 } from 'lucide-react';

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

  // دالة لتعديل الكمية بسرعة (زيادة أو نقصان)
  async function updateStock(id: number, currentStock: number, change: number) {
    const newStock = currentStock + change;
    if (newStock < 0) return; // منع الكمية من أن تصبح بالسالب
    
    const { error } = await supabase.from('inventory').update({ stock: newStock }).eq('id', id);
    if (!error) fetchInventory();
  }

  // دالة لحذف منتج بالكامل
  async function deleteItem(id: number) {
    if(confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (!error) fetchInventory();
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6" dir="rtl">
      <h1 className="text-2xl sm:text-3xl font-black text-[#AB9AF7] flex items-center gap-2 sm:gap-3">
        <Package size={28} className="sm:w-8 sm:h-8" /> إدارة المخزون
      </h1>

      {/* نموذج إضافة منتج جديد */}
      <form onSubmit={addItem} className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] flex flex-col md:flex-row gap-4 sm:gap-6 items-end shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex-1 w-full">
          <label className="block text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">اسم المنتج / المادة</label>
          <input 
            required
            placeholder="مثال: إبر ديرمابن، ماسك كولاجين..."
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] transition-all text-sm sm:text-base"
            value={newItem.product_name}
            onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
          />
        </div>
        <div className="w-full md:w-32 lg:w-48">
          <label className="block text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">الكمية</label>
          <input 
            required type="number"
            placeholder="0"
            className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 outline-none focus:border-[#AB9AF7] transition-all text-center font-black text-base sm:text-lg"
            value={newItem.stock}
            onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
          />
        </div>
        <button className="w-full md:w-auto bg-[#AB9AF7] text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:bg-[#9685e8] transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
          <Plus size={20} /> إضافة للمخزون
        </button>
      </form>

      {/* جدول المخزون (متوافق مع الهاتف) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-slate-700">
                <th className="p-4 sm:p-6">المنتج</th>
                <th className="p-4 sm:p-6 text-center">الكمية المتوفرة</th>
                <th className="p-4 sm:p-6">الحالة</th>
                <th className="p-4 sm:p-6 text-center">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4 sm:p-6 font-bold text-gray-800 dark:text-white text-sm sm:text-lg">
                    {item.product_name}
                  </td>
                  
                  <td className="p-4 sm:p-6 text-center">
                    <span className="text-xl sm:text-2xl font-black text-[#AB9AF7] bg-[#AB9AF7]/10 dark:bg-[#AB9AF7]/20 px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl inline-block min-w-[3rem]">
                      {item.stock}
                    </span>
                  </td>
                  
                  <td className="p-4 sm:p-6">
                    {item.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-red-100 dark:border-red-900/50 whitespace-nowrap">
                        <AlertTriangle size={14} /> نفدت الكمية!
                      </span>
                    ) : item.stock <= 5 ? (
                      <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-orange-100 dark:border-orange-900/50 whitespace-nowrap">
                        <AlertTriangle size={14} /> مخزون منخفض
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-green-100 dark:border-green-900/50 whitespace-nowrap">
                        <CheckCircle2 size={14} /> متوفر
                      </span>
                    )}
                  </td>

                  <td className="p-4 sm:p-6 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button onClick={() => updateStock(item.id, item.stock, 1)} className="p-1.5 sm:p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-[#AB9AF7] hover:text-white transition-colors">
                        <Plus size={16} />
                      </button>
                      <button onClick={() => updateStock(item.id, item.stock, -1)} className="p-1.5 sm:p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-orange-400 hover:text-white transition-colors">
                        <Minus size={16} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors ml-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12 sm:py-16 text-gray-400 font-bold text-sm sm:text-base">
            لا توجد منتجات في المخزون حالياً.
          </div>
        )}
      </div>
    </div>
  );
}