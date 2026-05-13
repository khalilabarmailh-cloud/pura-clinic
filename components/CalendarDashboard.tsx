'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';
import { Bell, CheckCircle, XCircle, DollarSign, Calendar as CalendarIcon, Activity, Plus, Trash2, TrendingUp, TrendingDown, Wallet, Edit2, Sun, Moon, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const serviceCategories = [
  { title: "💆‍♀️ العناية بالبشرة", services: ["هيدروفيشل للوجه", "هيدروفيشل للظهر", "هيدروفيشل لليدين", "تنظيف بشرة عميق"] },
  { title: "🌸 التجديد والنضارة", services: ["ديرمابين + ميزوثيرابي للوجه", "ديرمابين + ميزوثيرابي لليدين", "ديرمابين للسترتش مارك"] },
  { title: "✨ التصبغات وآثار الحبوب", services: ["تقشير كيميائي", "توحيد لون البشرة", "علاج آثار الحبوب والندبات"] },
  { title: "💡 جلسات متطورة", services: ["LED Therapy", "ماسكات علاجية", "ترطيب عميق"] },
  { title: "💋 التجميل", services: ["توريد الشفايف", "عناية وتفتيح الشفايف"] },
  { title: "🎁 البكجات", services: ["باكج النضارة", "باكج التجديد", "باكج العروس", "باكج الجسم"] }
];

export default function CalendarDashboard() {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [multiDates, setMultiDates] = useState([{ date: todayStr, time: '10:00' }]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempStatus, setTempStatus] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('كاش');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    fetchAppointments();
    fetchInventory();
    fetchPatientsList();
    fetchExpenses();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').order('appointment_time', { ascending: true });
    if (data) {
      setAppointments(data.filter(a => a.status !== 'قيد التأكيد'));
      setPendingBookings(data.filter(a => a.status === 'قيد التأكيد'));
    }
    setLoading(false);
  }

  async function fetchInventory() {
    // جلب كل المخزون عشان نحسب النواقص، ونفلتر للمنتجات المتاحة في القائمة المنسدلة
    const { data } = await supabase.from('inventory').select('*');
    if (data) setInventory(data);
  }

  async function fetchPatientsList() {
    const { data } = await supabase.from('patients').select('id, full_name, phone, loyalty_points').order('full_name');
    if (data) setPatientsList(data);
  }

  async function fetchExpenses() {
    const { data } = await supabase.from('expenses').select('*');
    if (data) setExpenses(data);
  }

  const startEditing = (apt: any) => {
    setEditingId(apt.id);
    setTempStatus(apt.status.includes('مكتمل') ? 'مكتمل' : apt.status);
    setPrice(apt.price?.toString() || '');
    setNoteText(apt.status_reason || '');
    setPaymentMethod(apt.payment_method || 'كاش');
    setSelectedProduct(apt.prescription || '');
  };

  const addDateField = () => setMultiDates([...multiDates, { date: todayStr, time: '10:00' }]);
  const removeDateField = (index: number) => setMultiDates(multiDates.filter((_, i) => i !== index));
  const handleDateChange = (index: number, field: 'date' | 'time', value: string) => {
    const updated = [...multiDates];
    updated[index][field as 'date' | 'time'] = value;
    setMultiDates(updated);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  async function handleAddAppointment(e: any) {
    e.preventDefault();
    if (!newPatientName) return alert("يرجى إدخال اسم المريض");
    if (selectedServices.length === 0) return alert("يرجى اختيار خدمة واحدة على الأقل");

    const existingPatient = patientsList.find(p => p.full_name === newPatientName);
    if (!existingPatient) {
      await supabase.from('patients').insert([
        { full_name: newPatientName, phone: 'غير مسجل', department: 'جلدية وتجميل', visit_count: 0, loyalty_points: 0 }
      ]);
    }

    const finalTreatment = selectedServices.join(' + ');

    const appointmentsToInsert = multiDates.map(dateTime => ({
      patient_name: newPatientName,
      appointment_date: dateTime.date,
      appointment_time: dateTime.time,
      treatment_type: finalTreatment,
      status: 'مجدول',
      is_paid: false
    }));

    const { error } = await supabase.from('appointments').insert(appointmentsToInsert);

    if (!error) {
      setShowAddForm(false);
      setNewPatientName('');
      setSelectedServices([]);
      setExpandedCategory(null);
      setMultiDates([{ date: selectedDate, time: '10:00' }]); 
      fetchAppointments();
      fetchPatientsList(); 
    } else alert("حدث خطأ أثناء إضافة المواعيد");
  }

  async function approveBooking(id: number, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) fetchAppointments();
  }

  const updateAppointmentStatus = async (id: number, targetStatus: string) => {
    const currentApt = appointments.find(a => a.id === id);
    let finalStatus = targetStatus;

    if (targetStatus === 'مكتمل' && currentApt?.status === 'مؤجل') finalStatus = 'مؤجل مكتمل';

    const updateData: any = { 
      status: finalStatus, 
      status_reason: noteText,
      price: price ? parseInt(price) : currentApt?.price || 0,
      payment_method: paymentMethod,
      prescription: selectedProduct,
      is_paid: finalStatus.includes('مكتمل') ? true : currentApt?.is_paid
    };

    if (targetStatus === 'مؤجل' && newDate && newTime) {
      updateData.appointment_date = newDate;
      updateData.appointment_time = newTime;
    }

    const { error: aptError } = await supabase.from('appointments').update(updateData).eq('id', id);

    if (!aptError) {
      if (finalStatus.includes('مكتمل')) {
        const amountPaid = price ? parseInt(price) : 0;
        
        const patient = patientsList.find(p => p.full_name === currentApt.patient_name);
        if (patient) {
          const newPoints = (patient.loyalty_points || 0) + amountPaid;
          const newVisitCount = (patient.visit_count || 0) + 1;
          await supabase.from('patients').update({ loyalty_points: newPoints, visit_count: newVisitCount, last_visit: todayStr }).eq('id', patient.id);
        }
        
        if (selectedProduct && !(currentApt.status || '').includes('مكتمل')) {
          const item = inventory.find(i => i.product_name === selectedProduct);
          if (item && item.stock > 0) {
             await supabase.from('inventory').update({ stock: item.stock - 1 }).eq('id', item.id);
          }
        }
      }
      fetchAppointments();
      fetchInventory();
      setEditingId(null); setNoteText(''); setPrice(''); setSelectedProduct(''); setNewDate(''); setNewTime('');
    } else alert("حدث خطأ أثناء التحديث");
  };

  const currentYear = currentMonthDate.getFullYear();
  const currentMonthNum = currentMonthDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dailyAppointments = appointments.filter((apt) => apt.appointment_date === selectedDate);
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.getMonth() + 1 === currentMonthNum && aptDate.getFullYear() === currentYear;
  });

  const dailyIncome = dailyAppointments.filter(a => a.status?.includes('مكتمل')).reduce((sum, a) => sum + (a.price || 0), 0);
  const monthlyIncome = monthlyAppointments.filter(a => a.status?.includes('مكتمل')).reduce((sum, a) => sum + (a.price || 0), 0);
  const monthlyExpenses = expenses.filter(exp => {
    if(!exp.date) return false;
    const expDate = new Date(exp.date);
    return expDate.getMonth() + 1 === currentMonthNum && expDate.getFullYear() === currentYear;
  }).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const netProfit = monthlyIncome - monthlyExpenses;
  const completedCount = monthlyAppointments.filter(a => a.status?.includes('مكتمل')).length;
  const postponedCount = monthlyAppointments.filter(a => a.status === 'مؤجل').length;
  const cancelledCount = monthlyAppointments.filter(a => a.status === 'ملغي').length;
  const totalStats = completedCount + postponedCount + cancelledCount || 1;

  // إحصائية المخزون المنخفض
  const lowStockCount = inventory.filter(item => item.stock <= 5).length;
  // المنتجات المتاحة فقط للقائمة المنسدلة
  const availableInventory = inventory.filter(item => item.stock > 0);

  const pieChartStyle = {
    background: `conic-gradient(#10B981 0% ${(completedCount/totalStats)*100}%, #F59E0B ${(completedCount/totalStats)*100}% ${((completedCount+postponedCount)/totalStats)*100}%, #EF4444 ${((completedCount+postponedCount)/totalStats)*100}% 100%)`
  };

  if (!mounted) return null;

  return (
    <div dir="rtl" className="space-y-6 p-3 sm:p-6 lg:p-8 pb-24 overflow-x-hidden">
      
      <div className="flex justify-between items-center mb-6 bg-white/50 dark:bg-slate-800/30 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#AB9AF7]">Pura Maria Clinic ✦</h1>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 sm:p-3 rounded-xl glass-card text-[#AB9AF7] hover:scale-105 transition-all shadow-sm">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        
        <div className="order-1 lg:order-2 lg:col-span-1 glass-card rounded-[2rem] p-4 sm:p-6 h-fit text-right shadow-sm w-full">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-800 dark:text-white">مواعيد {selectedDate}</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className={`p-2 sm:p-2.5 rounded-xl text-white font-bold transition-all shadow-md ${showAddForm ? 'bg-red-400' : 'bg-[#AB9AF7]'}`}>
              {showAddForm ? <XCircle size={18} /> : <Plus size={18} />}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAppointment} className="mb-6 bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-inner border border-gray-100 dark:border-slate-700 space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  placeholder="ابحث أو أدخل اسم المراجع..." 
                  value={newPatientName} 
                  onChange={e => {
                    setNewPatientName(e.target.value);
                    setIsPatientDropdownOpen(true);
                  }} 
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsPatientDropdownOpen(false), 200)}
                  className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 rounded-xl outline-none bg-gray-50 dark:bg-slate-900 focus:border-[#AB9AF7] transition-all" 
                />
                
                {isPatientDropdownOpen && newPatientName && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {patientsList.filter(p => p.full_name.includes(newPatientName)).length > 0 ? (
                      patientsList.filter(p => p.full_name.includes(newPatientName)).map(p => (
                        <div 
                          key={p.id} 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setNewPatientName(p.full_name);
                            setIsPatientDropdownOpen(false);
                          }}
                          className="p-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-50 dark:border-slate-700 last:border-0 font-bold flex justify-between items-center"
                        >
                          <span>{p.full_name}</span>
                          <span className="text-[10px] text-gray-400 font-normal bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-md" dir="ltr">{p.phone}</span>
                        </div>
                      ))
                    ) : (
                      <div 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsPatientDropdownOpen(false);
                        }}
                        className="p-3 text-sm text-[#AB9AF7] font-bold flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <Plus size={16} /> اعتماد الاسم "{newPatientName}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-2 max-h-52 overflow-y-auto pr-1">
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
                <div className="p-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl flex flex-wrap gap-1.5">
                  {selectedServices.map((s, idx) => (
                    <span key={idx} className="bg-[#AB9AF7] text-white text-[9px] px-2 py-1 rounded font-bold">{s}</span>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl space-y-3">
                {multiDates.map((dateTime, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input type="date" required value={dateTime.date} onChange={e => handleDateChange(index, 'date', e.target.value)} className="w-full p-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-transparent" />
                    <input type="time" required value={dateTime.time} onChange={e => handleDateChange(index, 'time', e.target.value)} className="w-full p-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-transparent" />
                    {multiDates.length > 1 && <button type="button" onClick={() => removeDateField(index)} className="text-red-400"><Trash2 size={16}/></button>}
                  </div>
                ))}
                <button type="button" onClick={addDateField} className="text-xs text-[#AB9AF7] font-black w-full py-2">+ إضافة جلسة أخرى</button>
              </div>
              <button type="submit" className="w-full bg-[#AB9AF7] text-white py-3 rounded-xl text-sm font-black shadow-lg hover:scale-[1.02] transition-all">حفظ المواعيد ({multiDates.length})</button>
            </form>
          )}

          <div className="space-y-4">
            {dailyAppointments.length === 0 && <p className="text-center text-sm text-gray-400 py-4 font-bold">لا يوجد مواعيد في هذا اليوم</p>}
            {dailyAppointments.map((apt) => (
              <div key={apt.id} className="p-4 sm:p-5 border border-white dark:border-slate-700 rounded-2xl bg-white/60 dark:bg-slate-800 border-r-4 border-r-[#AB9AF7] shadow-sm">
                <p className="font-black text-base sm:text-lg text-gray-900 dark:text-white">{apt.patient_name}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">{apt.appointment_time} - <span className="text-[#AB9AF7] font-bold text-[10px] sm:text-xs leading-relaxed">{apt.treatment_type}</span></p>
                
                {editingId === apt.id ? (
                  <div className="mt-4 space-y-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl shadow-inner border border-gray-100 dark:border-slate-800">
                    <div className="flex gap-1 sm:gap-2 mb-3 bg-gray-50 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
                      <button type="button" onClick={() => setTempStatus('مكتمل')} className={`text-[10px] sm:text-xs font-bold w-full py-2 rounded-md whitespace-nowrap ${tempStatus === 'مكتمل' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>مكتمل</button>
                      <button type="button" onClick={() => setTempStatus('مؤجل')} className={`text-[10px] sm:text-xs font-bold w-full py-2 rounded-md whitespace-nowrap ${tempStatus === 'مؤجل' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>مؤجل</button>
                      <button type="button" onClick={() => setTempStatus('ملغي')} className={`text-[10px] sm:text-xs font-bold w-full py-2 rounded-md whitespace-nowrap ${tempStatus === 'ملغي' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>ملغي</button>
                    </div>
                    
                    {tempStatus === 'مكتمل' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <input type="number" placeholder="المبلغ" value={price} className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setPrice(e.target.value)} />
                          <select className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option value="كاش">كاش</option><option value="شبكة">شبكة</option></select>
                        </div>
                        <select className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                          <option value="">-- منتج منصرف --</option>
                          {availableInventory.map((item, idx) => <option key={idx} value={item.product_name}>{item.product_name} ({item.stock})</option>)}
                        </select>
                      </div>
                    )}
                    {tempStatus === 'مؤجل' && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                        <input type="date" className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setNewDate(e.target.value)} />
                        <input type="time" className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setNewTime(e.target.value)} />
                      </div>
                    )}
                    <textarea placeholder="ملاحظات..." value={noteText} className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl min-h-[60px] outline-none" onChange={e => setNoteText(e.target.value)} />
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => updateAppointmentStatus(apt.id, tempStatus)} className="bg-[#AB9AF7] text-white text-xs sm:text-sm py-2 sm:py-3 rounded-xl w-full font-black shadow-md hover:bg-[#9685e8]">حفظ</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs sm:text-sm py-2 sm:py-3 rounded-xl w-full font-bold">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {apt.status?.includes('مكتمل') ? (
                      <div className="mt-3 sm:mt-4 flex justify-between bg-green-50/80 dark:bg-green-900/20 p-2 sm:p-3 rounded-xl border border-green-100 dark:border-green-900/50"><span className="text-[10px] sm:text-xs font-black text-green-700 dark:text-green-400">✅ تم الجلسة</span><button onClick={() => startEditing(apt)} className="text-green-600"><Edit2 size={14} /></button></div>
                    ) : apt.status === 'مؤجل' ? (
                      <div className="mt-3 sm:mt-4 flex justify-between bg-yellow-50/80 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/50"><span className="text-[10px] sm:text-xs font-black text-yellow-700 dark:text-yellow-400">⏱ مؤجل</span><button onClick={() => startEditing(apt)} className="text-yellow-600"><Edit2 size={14} /></button></div>
                    ) : apt.status === 'ملغي' ? (
                      <div className="mt-3 sm:mt-4 flex justify-between bg-red-50/80 dark:bg-red-900/20 p-2 sm:p-3 rounded-xl border border-red-100 dark:border-red-900/50"><span className="text-[10px] sm:text-xs font-black text-red-700 dark:text-red-400">❌ ملغي</span><button onClick={() => startEditing(apt)} className="text-red-600"><Edit2 size={14} /></button></div>
                    ) : (
                      <div className="mt-3 sm:mt-4 flex gap-1 sm:gap-2">
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('مكتمل');}} className="text-[10px] sm:text-[11px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">✔ إتمام</button>
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('مؤجل');}} className="text-[10px] sm:text-[11px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">⏱ تأجيل</button>
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('ملغي');}} className="text-[10px] sm:text-[11px] bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">✖ إلغاء</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="order-2 lg:order-1 lg:col-span-2 space-y-6 w-full overflow-hidden">
          {pendingBookings.length > 0 && (
            <div className="glass-card bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm sm:text-base text-yellow-800 dark:text-yellow-400 font-bold mb-4 flex items-center gap-2"><Bell className="animate-bounce" /> طلبات حجز إلكتروني ({pendingBookings.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {pendingBookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-yellow-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100">{booking.patient_name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{booking.appointment_date} | {booking.appointment_time}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#AB9AF7] mt-1">{booking.treatment_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveBooking(booking.id, 'مجدول')} className="bg-green-500 text-white p-1.5 sm:p-2 rounded-lg"><CheckCircle size={16}/></button>
                      <button onClick={() => approveBooking(booking.id, 'ملغي')} className="bg-red-500 text-white p-1.5 sm:p-2 rounded-lg"><XCircle size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======== تم تعديل الشبكة لتصبح 5 بطاقات وتضمين بطاقة المخزون ======== */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="glass-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 sm:w-2 h-full bg-green-400"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">دخل اليوم</p><h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">{dailyIncome} <span className="text-[10px] sm:text-xs text-gray-400">JD</span></h3></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center text-green-500"><DollarSign size={16} className="sm:w-5 sm:h-5" /></div>
              </div>
            </div>
            <div className="glass-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 sm:w-2 h-full bg-[#AB9AF7]"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">دخل الشهر</p><h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">{monthlyIncome} <span className="text-[10px] sm:text-xs text-gray-400">JD</span></h3></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#AB9AF7]/10 rounded-lg sm:rounded-xl flex items-center justify-center text-[#AB9AF7]"><Wallet size={16} className="sm:w-5 sm:h-5" /></div>
              </div>
            </div>
            <div className="glass-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 sm:w-2 h-full bg-red-400"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">المصاريف</p><h3 className="text-lg sm:text-2xl font-black text-red-600 dark:text-red-400">{monthlyExpenses} <span className="text-[10px] sm:text-xs text-gray-400">JD</span></h3></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg sm:rounded-xl flex items-center justify-center text-red-500"><TrendingDown size={16} className="sm:w-5 sm:h-5" /></div>
              </div>
            </div>
            <div className="glass-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 sm:w-2 h-full bg-yellow-400"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">الربح</p><h3 className={`text-lg sm:text-2xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit} <span className="text-[10px] sm:text-xs text-gray-400">JD</span></h3></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-50 rounded-lg sm:rounded-xl flex items-center justify-center text-yellow-600"><TrendingUp size={16} className="sm:w-5 sm:h-5" /></div>
              </div>
            </div>
            {/* بطاقة تنبيه المخزون */}
            <div className="glass-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] relative overflow-hidden col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-1 sm:w-2 h-full bg-orange-400"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">تنبيه المخزون</p><h3 className={`text-lg sm:text-2xl font-black ${lowStockCount > 0 ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{lowStockCount} <span className="text-[10px] sm:text-xs text-gray-400">نواقص</span></h3></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 rounded-lg sm:rounded-xl flex items-center justify-center text-orange-500"><AlertTriangle size={16} className="sm:w-5 sm:h-5" /></div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#AB9AF7]">{currentMonthDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={() => setCurrentMonthDate(new Date(currentYear, currentMonthNum, 1))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm font-bold flex-1 sm:flex-none">التالي</button>
                <button onClick={() => {setCurrentMonthDate(new Date()); setSelectedDate(todayStr);}} className="p-2 bg-[#AB9AF7] text-white rounded-lg text-xs sm:text-sm font-bold shadow-md flex-1 sm:flex-none">اليوم</button>
                <button onClick={() => setCurrentMonthDate(new Date(currentYear, currentMonthNum - 2, 1))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm font-bold flex-1 sm:flex-none">السابق</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6 sm:mb-8">
              {days.map(day => {
                const dateStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                return (
                  <button key={day} onClick={() => { setSelectedDate(dateStr); if(multiDates.length === 1) handleDateChange(0, 'date', dateStr); }} 
                    className={`p-1.5 sm:p-3 rounded-md sm:rounded-lg border transition-all text-xs sm:text-base ${isSelected ? 'bg-[#AB9AF7] text-white shadow-md scale-105' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                    {day}
                    {appointments.some(apt => apt.appointment_date === dateStr) && !isSelected && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#AB9AF7] rounded-full mx-auto mt-0.5 sm:mt-1"></div>}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-slate-700 pb-4 mb-6 gap-4">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm sm:text-lg">تحليل الشهر ({completedCount} جلسة)</h3>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-inner border-2 border-white dark:border-slate-800" style={pieChartStyle}></div>
            </div>

            <div className="overflow-x-auto pb-4 w-full">
              <table className="w-full min-w-[500px] text-xs sm:text-sm text-right">
                <thead><tr className="bg-gray-50/50 dark:bg-slate-800 text-gray-500 dark:text-gray-300"><th className="p-3 sm:p-4 rounded-r-xl">المريض</th><th className="p-3 sm:p-4">الحالة</th><th className="p-3 sm:p-4">المبلغ</th><th className="p-3 sm:p-4 rounded-l-xl">الوصفة</th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">{monthlyAppointments.filter(a => a.status && a.status !== 'مجدول').map(apt => (
                    <tr key={apt.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50">
                      <td className="p-3 sm:p-4 font-black text-gray-800 dark:text-white">{apt.patient_name}</td>
                      <td className="p-3 sm:p-4"><span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold ${apt.status.includes('مكتمل') ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>{apt.status}</span></td>
                      <td className="p-3 sm:p-4 font-black text-gray-700 dark:text-gray-300">{apt.price || 0} JD</td>
                      <td className="p-3 sm:p-4 text-[#AB9AF7] whitespace-nowrap">{apt.prescription || '-'}</td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}