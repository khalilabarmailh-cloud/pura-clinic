'use client';
import { useState, useEffect } from 'react';
import { Activity, Save, AlertTriangle, Droplet, X, MousePointerClick, ChevronRight, ChevronLeft } from 'lucide-react';

interface ToothData {
  pd: string[]; 
  recession: string;
  mobility: string;
  bleeding: boolean;
}

export default function PeriodontalChart() {
  const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
  const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i);

  const [chartData, setChartData] = useState<Record<number, ToothData>>({});
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]); // مصفوفة التحديد المتعدد
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialData: Record<number, ToothData> = {};
    [...UPPER_TEETH, ...LOWER_TEETH].forEach(num => {
      initialData[num] = { pd: ['', '', '', '', '', ''], recession: '', mobility: '0', bleeding: false };
    });
    setChartData(initialData);
  }, []);

  // دالة تحديد/إلغاء تحديد السن
  const toggleSelection = (num: number) => {
    if (selectedTeeth.includes(num)) {
      setSelectedTeeth(selectedTeeth.filter(t => t !== num));
    } else {
      setSelectedTeeth([...selectedTeeth, num]);
    }
  };

  // تطبيق البيانات على كل الأسنان المحددة
  const applyBulkData = (updates: Partial<ToothData> | { pdValue: string }) => {
    setChartData(prev => {
      const newData = { ...prev };
      selectedTeeth.forEach(num => {
        if ('pdValue' in updates) {
          // إذا كان إدخال عمق موحد (للست نقاط معاً)
          newData[num].pd = Array(6).fill(updates.pdValue);
        } else {
          // تحديثات الحقول الأخرى (نزيف، حركة، إلخ)
          newData[num] = { ...newData[num], ...updates };
        }
      });
      return newData;
    });
    if (!('pd' in updates || 'pdValue' in updates)) {
        // نترك التحديد إذا كان فقط تعديل بسيط، أو نفرغه إذا انتهينا
    }
  };

  if (!mounted) return null;

  const countDeepPockets = () => {
    let count = 0;
    Object.values(chartData).forEach(tooth => {
      tooth.pd.forEach(depth => { if (parseInt(depth) >= 4) count++; });
    });
    return count;
  };

  return (
    <div className="space-y-8 pb-32" dir="rtl">
      
      {/* الهيدر */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#AB9AF7] flex items-center gap-3">
            <Activity size={32} /> مخطط اللثة المتطور
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">المراجع: أحمد محمود | سجل الأسنان الاحترافي</p>
        </div>
        <button className="bg-[#AB9AF7] text-white px-8 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-all">
          حفظ التقرير
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* شبكة الأسنان التفاعلية */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-8 text-center flex items-center justify-center gap-2">
            <MousePointerClick size={20} className="text-[#AB9AF7]" /> حدد الأسنان المراد فحصها
          </h2>
          
          <div className="space-y-12">
            <div>
              <p className="text-center text-[10px] font-black text-gray-400 mb-4 tracking-widest uppercase">الفك العلوي</p>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {UPPER_TEETH.map(num => (
                  <button 
                    key={num} onClick={() => toggleSelection(num)}
                    className={`w-10 h-16 md:w-12 md:h-20 rounded-b-2xl rounded-t-lg border-2 font-black text-sm flex flex-col items-center justify-center relative transition-all ${
                      selectedTeeth.includes(num)
                        ? 'border-[#AB9AF7] bg-[#AB9AF7] text-white scale-110 shadow-[0_0_15px_rgba(171,154,247,0.4)] z-10' 
                        : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 hover:border-[#AB9AF7]/50'
                    }`}
                  >
                    {num}
                    <div className="absolute -bottom-1 flex gap-0.5">
                       {chartData[num]?.pd.some(v => parseInt(v) >= 4) && <div className="w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>}
                       {chartData[num]?.bleeding && <Droplet size={8} className="text-red-400 fill-red-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {LOWER_TEETH.map(num => (
                  <button 
                    key={num} onClick={() => toggleSelection(num)}
                    className={`w-10 h-16 md:w-12 md:h-20 rounded-t-2xl rounded-b-lg border-2 font-black text-sm flex flex-col items-center justify-center relative transition-all ${
                      selectedTeeth.includes(num)
                        ? 'border-[#AB9AF7] bg-[#AB9AF7] text-white scale-110 shadow-[0_0_15px_rgba(171,154,247,0.4)] z-10' 
                        : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 hover:border-[#AB9AF7]/50'
                    }`}
                  >
                    <div className="absolute -top-1 flex gap-0.5">
                       {chartData[num]?.pd.some(v => parseInt(v) >= 4) && <div className="w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>}
                       {chartData[num]?.bleeding && <Droplet size={8} className="text-red-400 fill-red-400" />}
                    </div>
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] font-black text-gray-400 mt-4 tracking-widest uppercase">الفك السفلي</p>
            </div>
          </div>
        </div>

        {/* لوحة التحكم الجانبية (ذكية: تتغير حسب عدد الأسنان) */}
        <div className="glass-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 h-fit sticky top-8">
          {selectedTeeth.length === 0 ? (
            <div className="text-center py-20 opacity-40">
              <MousePointerClick size={48} className="mx-auto mb-4" />
              <p className="font-bold">يرجى اختيار سن واحد أو أكثر للبدء</p>
            </div>
          ) : selectedTeeth.length === 1 ? (
            /* واجهة السن الواحد (تفصيلية 6 نقاط) */
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[#AB9AF7]/10 p-4 rounded-2xl border border-[#AB9AF7]/20">
                <h3 className="font-black text-[#AB9AF7]">فحص سن فردي: {selectedTeeth[0]}</h3>
                <button onClick={() => setSelectedTeeth([])}><X size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 block">عمق الجيوب (6 نقاط)</label>
                <div className="grid grid-cols-3 gap-2">
                  {chartData[selectedTeeth[0]].pd.map((val, idx) => (
                    <input 
                      key={idx} type="number" placeholder="-" 
                      className={`w-full p-3 text-center font-black rounded-xl border-2 outline-none transition-all ${parseInt(val) >= 4 ? 'border-red-400 bg-red-50' : 'bg-gray-50 dark:bg-slate-800'}`}
                      value={val} onChange={(e) => {
                        const newPd = [...chartData[selectedTeeth[0]].pd];
                        newPd[idx] = e.target.value;
                        setChartData({...chartData, [selectedTeeth[0]]: {...chartData[selectedTeeth[0]], pd: newPd}});
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input placeholder="الانحسار" type="number" className="p-3 rounded-xl border bg-gray-50 dark:bg-slate-800 text-center font-bold" value={chartData[selectedTeeth[0]].recession} onChange={e => setChartData({...chartData, [selectedTeeth[0]]: {...chartData[selectedTeeth[0]], recession: e.target.value}})} />
                    <select className="p-3 rounded-xl border bg-gray-50 dark:bg-slate-800 font-bold" value={chartData[selectedTeeth[0]].mobility} onChange={e => setChartData({...chartData, [selectedTeeth[0]]: {...chartData[selectedTeeth[0]], mobility: e.target.value}})}>
                        <option value="0">حركة 0</option><option value="1">I</option><option value="2">II</option><option value="3">III</option>
                    </select>
                </div>
                <button 
                  onClick={() => setChartData({...chartData, [selectedTeeth[0]]: {...chartData[selectedTeeth[0]], bleeding: !chartData[selectedTeeth[0]].bleeding}})}
                  className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 border-2 ${chartData[selectedTeeth[0]].bleeding ? 'bg-red-50 border-red-400 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  <Droplet size={18} /> نزيف (BOP)
                </button>
              </div>
            </div>
          ) : (
            /* واجهة التحديد المتعدد (إدخال جماعي سريع) */
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                <h3 className="font-black text-orange-600">تعديل ({selectedTeeth.length}) أسنان معاً</h3>
                <button onClick={() => setSelectedTeeth([])} className="text-orange-600"><X size={18} /></button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">تطبيق عمق موحد لجميع النقاط:</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button 
                        key={v} onClick={() => applyBulkData({ pdValue: v.toString() })}
                        className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${v >= 4 ? 'hover:bg-red-500 hover:text-white border-red-200' : 'hover:bg-[#AB9AF7] hover:text-white border-gray-100'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => applyBulkData({ bleeding: true })} className="py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold bg-red-50 hover:bg-red-100">تحديد نزيف</button>
                   <button onClick={() => applyBulkData({ bleeding: false })} className="py-3 rounded-xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50">إلغاء النزيف</button>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">تحديد درجة الحركة للمجموعة:</label>
                  <div className="flex gap-2">
                    {['0', '1', '2', '3'].map(m => (
                       <button key={m} onClick={() => applyBulkData({ mobility: m })} className="flex-1 py-2 rounded-lg border font-black hover:border-[#AB9AF7]">M{m}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ملخص الحالة */}
      <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
          <div>
            <h4 className="font-black text-gray-800 dark:text-white">إحصائيات الفحص الحالية</h4>
            <p className="text-xs font-bold text-gray-500">تم اكتشاف {countDeepPockets()} جيب لثوي عميق (≥ 4mm)</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">الأسنان المحددة</p>
              <p className="text-xl font-black text-[#AB9AF7]">{selectedTeeth.length}</p>
           </div>
           <div className="w-[1px] bg-gray-100"></div>
           <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">نسبة النزيف</p>
              <p className="text-xl font-black text-red-500">
                {Math.round((Object.values(chartData).filter(t => t.bleeding).length / 32) * 100)}%
              </p>
           </div>
        </div>
      </div>

    </div>
  );
}