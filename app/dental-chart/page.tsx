'use client';
import { useState } from 'react';
import { Stethoscope, Save, Trash2, X, AlertTriangle, CheckCircle2, MousePointerClick } from 'lucide-react';

const TOOTH_STATES = {
  HEALTHY: { label: 'سليم', color: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600' },
  DECAY: { label: 'تسوس (Decay)', color: 'bg-red-400 border-red-500 text-white' },
  FILLED: { label: 'حشوة (Filled)', color: 'bg-blue-400 border-blue-500 text-white' },
  EXTRACTED: { label: 'مخلوع (Extracted)', color: 'bg-gray-200 dark:bg-gray-700 border-gray-400 opacity-50' },
  RCT: { label: 'سحب عصب (RCT)', color: 'bg-yellow-400 border-yellow-500 text-yellow-900' },
  IMPLANT: { label: 'زراعة (Implant)', color: 'bg-purple-400 border-purple-500 text-white' },
};

export default function DentalChart() {
  const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
  const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i);

  const [teethData, setTeethData] = useState<Record<number, string>>({});
  
  // المصفوفة الجديدة لتخزين الأسنان المحددة (تحديد متعدد)
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  
  const [treatmentPlan, setTreatmentPlan] = useState<any[]>([]);

  // دالة تحديد وإلغاء تحديد السن
  const toggleToothSelection = (num: number) => {
    if (selectedTeeth.includes(num)) {
      setSelectedTeeth(selectedTeeth.filter(t => t !== num)); // إلغاء التحديد
    } else {
      setSelectedTeeth([...selectedTeeth, num]); // إضافة للتحديد
    }
  };

  // دالة تطبيق الإجراء على كل الأسنان المحددة دفعة واحدة
  const handleMultiStatusChange = (statusKey: string) => {
    if (selectedTeeth.length === 0) return;

    const newTeethData = { ...teethData };
    const newTreatments = [...treatmentPlan];

    selectedTeeth.forEach(tooth => {
      // 1. تغيير اللون بالمخطط
      newTeethData[tooth] = statusKey;

      // 2. إضافتها لخطة العلاج إذا لم تكن سليمة
      if (statusKey !== 'HEALTHY') {
        newTreatments.push({
          id: Date.now() + Math.random(), // رقم مميز لكل إجراء
          tooth: tooth,
          procedure: TOOTH_STATES[statusKey as keyof typeof TOOTH_STATES].label,
          phase: 'المرحلة 1 (عاجل)',
          cost: '',
        });
      }
    });

    setTeethData(newTeethData);
    setTreatmentPlan(newTreatments);
    setSelectedTeeth([]); // تفريغ التحديد بعد التنفيذ
  };

  const removeTreatment = (id: number) => {
    setTreatmentPlan(treatmentPlan.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8 pb-32" dir="rtl">
      
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#AB9AF7] flex items-center gap-3">
            <Stethoscope size={32} /> عيادة طب الأسنان
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">المراجع: أحمد محمود | رقم الملف: DENT-2026</p>
        </div>
        <button className="bg-[#AB9AF7] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2">
          <Save size={20} /> حفظ الجلسة
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* المخطط السني */}
        <div className="xl:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm flex flex-col items-center border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-8 w-full text-center border-b dark:border-slate-700 pb-4 flex justify-center items-center gap-2">
            المخطط السني <span className="text-xs bg-[#AB9AF7]/20 text-[#AB9AF7] px-2 py-1 rounded-lg">يدعم التحديد المتعدد</span>
          </h2>
          
          <div className="w-full max-w-3xl space-y-12">
            
            {/* الفك العلوي */}
            <div>
              <p className="text-center text-xs font-bold text-gray-400 mb-4">الفك العلوي (Upper Arch)</p>
              <div className="flex justify-center gap-1 md:gap-2">
                {UPPER_TEETH.map(num => {
                  const state = teethData[num] || 'HEALTHY';
                  const style = TOOTH_STATES[state as keyof typeof TOOTH_STATES].color;
                  const isSelected = selectedTeeth.includes(num);
                  
                  return (
                    <div key={num} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500">{num}</span>
                      <button 
                        onClick={() => toggleToothSelection(num)}
                        className={`w-8 h-12 md:w-10 md:h-16 rounded-b-xl rounded-t-sm border-2 shadow-sm transition-all hover:scale-110 
                          ${style} 
                          ${isSelected ? 'ring-4 ring-[#AB9AF7] border-[#AB9AF7] scale-110 shadow-[0_0_15px_rgba(171,154,247,0.5)]' : ''}
                        `}
                        title={`السن ${num}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الفك السفلي */}
            <div>
              <div className="flex justify-center gap-1 md:gap-2">
                {LOWER_TEETH.map(num => {
                  const state = teethData[num] || 'HEALTHY';
                  const style = TOOTH_STATES[state as keyof typeof TOOTH_STATES].color;
                  const isSelected = selectedTeeth.includes(num);
                  
                  return (
                    <div key={num} className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => toggleToothSelection(num)}
                        className={`w-8 h-12 md:w-10 md:h-16 rounded-t-xl rounded-b-sm border-2 shadow-sm transition-all hover:scale-110 
                          ${style}
                          ${isSelected ? 'ring-4 ring-[#AB9AF7] border-[#AB9AF7] scale-110 shadow-[0_0_15px_rgba(171,154,247,0.5)]' : ''}
                        `}
                        title={`السن ${num}`}
                      />
                      <span className="text-[10px] font-bold text-gray-500">{num}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs font-bold text-gray-400 mt-4">الفك السفلي (Lower Arch)</p>
            </div>

          </div>

          {/* مفتاح الألوان */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 border-t dark:border-slate-700 w-full pt-6">
            {Object.entries(TOOTH_STATES).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border ${val.color}`}></div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* خطة العلاج */}
        <div className="glass-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" /> خطة العلاج المجمعة
          </h2>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {treatmentPlan.map((plan, index) => (
              <div key={plan.id} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 relative group">
                <button onClick={() => removeTreatment(plan.id)} className="absolute top-3 left-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-[#AB9AF7]/10 text-[#AB9AF7] px-2 py-1 rounded-md text-[10px] font-black mr-2">سن {plan.tooth}</span>
                    <span className="font-bold text-gray-800 dark:text-white text-sm">{plan.procedure}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <select 
                    className="p-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-transparent font-bold outline-none"
                    value={plan.phase}
                    onChange={(e) => {
                      const updated = [...treatmentPlan];
                      updated[index].phase = e.target.value;
                      setTreatmentPlan(updated);
                    }}
                  >
                    <option>المرحلة 1 (عاجل)</option>
                    <option>المرحلة 2 (تجميلي)</option>
                    <option>المرحلة 3 (متابعة)</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="التكلفة (JD)" 
                    className="p-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-transparent text-left font-black outline-none focus:border-[#AB9AF7]"
                    dir="ltr"
                    value={plan.cost}
                    onChange={(e) => {
                      const updated = [...treatmentPlan];
                      updated[index].cost = e.target.value;
                      setTreatmentPlan(updated);
                    }}
                  />
                </div>
              </div>
            ))}
            
            {treatmentPlan.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center text-gray-400">
                <AlertTriangle size={32} className="mb-2 opacity-50" />
                <p className="font-bold text-sm">لم يتم تحديد أي إجراءات بعد</p>
              </div>
            )}
          </div>
          
          {treatmentPlan.length > 0 && (
            <div className="mt-6 pt-4 border-t dark:border-slate-700 flex justify-between items-center">
              <span className="font-bold text-gray-500">إجمالي التكلفة:</span>
              <span className="text-2xl font-black text-[#AB9AF7]">
                {treatmentPlan.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)} JD
              </span>
            </div>
          )}
        </div>
      </div>

      {/* شريط الإجراءات العائم (يظهر فقط عند تحديد أسنان) */}
      {selectedTeeth.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in w-11/12 max-w-4xl">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#AB9AF7]/30 shadow-[0_10px_40px_rgba(171,154,247,0.2)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-[#AB9AF7] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">
                {selectedTeeth.length}
              </div>
              <div>
                <h3 className="font-black text-gray-800 dark:text-white">أسنان محددة</h3>
                <p className="text-xs text-gray-500 font-bold">{selectedTeeth.join(', ')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-gray-400 ml-2 hidden md:block">تطبيق إجراء:</span>
              {Object.entries(TOOTH_STATES).map(([key, val]) => (
                <button 
                  key={key}
                  onClick={() => handleMultiStatusChange(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 border ${val.color.replace('bg-', 'bg-opacity-10 text-').replace('border-', 'border-').split(' ')[0]} ${val.color.split(' ')[0].replace('bg-', 'text-')}`}
                >
                  {val.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setSelectedTeeth([])}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title="إلغاء التحديد"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}