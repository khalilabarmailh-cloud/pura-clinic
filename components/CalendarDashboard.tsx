'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';
import { Bell, CheckCircle, XCircle, DollarSign, Calendar as CalendarIcon, Activity, Plus, Trash2, TrendingUp, TrendingDown, Wallet, Edit2, Sun, Moon } from 'lucide-react';

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
  const [newTreatmentType, setNewTreatmentType] = useState('تنظيف بشرة عميق');
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
    const { data } = await supabase.from('inventory').select('id, product_name, stock').gt('stock', 0);
    if (data) setInventory(data);
  }

  async function fetchPatientsList() {
    const { data } = await supabase.from('patients').select('id, full_name, loyalty_points').order('full_name');
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

  async function handleAddAppointment(e: any) {
    e.preventDefault();
    if (!newPatientName) return alert("يرجى إدخال اسم المريض");

    const appointmentsToInsert = multiDates.map(dateTime => ({
      patient_name: newPatientName,
      appointment_date: dateTime.date,
      appointment_time: dateTime.time,
      treatment_type: newTreatmentType,
      status: 'مجدول',
      is_paid: false
    }));

    const { error } = await supabase.from('appointments').insert(appointmentsToInsert);

    if (!error) {
      setShowAddForm(false);
      setNewPatientName('');
      setMultiDates([{ date: selectedDate, time: '10:00' }]); 
      fetchAppointments();
    } else alert("حدث خطأ أثناء إضافة المواعيد");
  }

  async function approveBooking(id: number, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) fetchAppointments();
  }

  // الدالة المعدلة التي تحل مشكلة المخزون والنقاط
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
        
        // 1. تحديث النقاط وآخر زيارة
        const patient = patientsList.find(p => p.full_name === currentApt.patient_name);
        if (patient) {
          const newPoints = (patient.loyalty_points || 0) + amountPaid;
          await supabase.from('patients').update({ loyalty_points: newPoints, last_visit: todayStr }).eq('id', patient.id);
        }
        
        // 2. خصم المخزون فقط إذا لم يكن الموعد مكتمل سابقاً
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

  const pieChartStyle = {
    background: `conic-gradient(#10B981 0% ${(completedCount/totalStats)*100}%, #F59E0B ${(completedCount/totalStats)*100}% ${((completedCount+postponedCount)/totalStats)*100}%, #EF4444 ${((completedCount+postponedCount)/totalStats)*100}% 100%)`
  };

  if (!mounted) return null;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl lg:text-3xl font-black text-[#AB9AF7]">Pura Maria Clinic ✦</h1>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl glass-card text-[#AB9AF7] hover:scale-105 transition-all shadow-sm">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* قسم طلبات الحجز الإلكتروني (عاد من جديد) */}
          {pendingBookings.length > 0 && (
            <div className="glass-card bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-yellow-800 dark:text-yellow-400 font-bold mb-4 flex items-center gap-2"><Bell className="animate-bounce" /> طلبات حجز إلكتروني ({pendingBookings.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-yellow-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{booking.patient_name}</p>
                      <p className="text-xs text-gray-500">{booking.appointment_date} | {booking.appointment_time}</p>
                      <p className="text-[10px] font-bold text-[#AB9AF7] mt-1">{booking.treatment_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveBooking(booking.id, 'مجدول')} className="bg-green-500 text-white p-2 rounded-lg"><CheckCircle size={18}/></button>
                      <button onClick={() => approveBooking(booking.id, 'ملغي')} className="bg-red-500 text-white p-2 rounded-lg"><XCircle size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الإحصائيات المالية بالتصميم الفخم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-green-400"></div>
              <div className="flex justify-between items-start">
                <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">دخل اليوم</p><h3 className="text-2xl font-black text-gray-900 dark:text-white">{dailyIncome} <span className="text-xs font-medium text-gray-400">JD</span></h3></div>
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-500"><DollarSign size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#AB9AF7]"></div>
              <div className="flex justify-between items-start">
                <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">دخل الشهر</p><h3 className="text-2xl font-black text-gray-900 dark:text-white">{monthlyIncome} <span className="text-xs font-medium text-gray-400">JD</span></h3></div>
                <div className="w-10 h-10 bg-[#AB9AF7]/10 rounded-xl flex items-center justify-center text-[#AB9AF7]"><Wallet size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>
              <div className="flex justify-between items-start">
                <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">مصاريف الشهر</p><h3 className="text-2xl font-black text-red-600 dark:text-red-400">{monthlyExpenses} <span className="text-xs font-medium text-gray-400">JD</span></h3></div>
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500"><TrendingDown size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>
              <div className="flex justify-between items-start">
                <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">صافي الربح</p><h3 className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{netProfit} <span className="text-xs font-medium text-gray-400">JD</span></h3></div>
                <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600"><TrendingUp size={20} /></div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-xl font-bold text-[#AB9AF7]">{currentMonthDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonthDate(new Date(currentYear, currentMonthNum, 1))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-bold">التالي</button>
                <button onClick={() => {setCurrentMonthDate(new Date()); setSelectedDate(todayStr);}} className="p-2 bg-[#AB9AF7] text-white rounded-lg text-sm font-bold shadow-md">اليوم</button>
                <button onClick={() => setCurrentMonthDate(new Date(currentYear, currentMonthNum - 2, 1))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-bold">السابق</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-8">
              {days.map(day => {
                const dateStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                return (
                  <button key={day} onClick={() => { setSelectedDate(dateStr); if(multiDates.length === 1) handleDateChange(0, 'date', dateStr); }} className={`p-3 rounded-lg border transition-all ${isSelected ? 'bg-[#AB9AF7] text-white shadow-md scale-105' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                    {day}
                    {appointments.some(apt => apt.appointment_date === dateStr) && !isSelected && <div className="w-1.5 h-1.5 bg-[#AB9AF7] rounded-full mx-auto mt-1"></div>}
                  </button>
                );
              })}
            </div>

            {/* الرسم البياني الدائري (عاد من جديد) */}
            <div className="flex items-center justify-between border-b dark:border-slate-700 pb-4 mb-6">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">تحليل أداء الشهر ({completedCount} جلسة)</h3>
              <div className="w-20 h-20 rounded-full shadow-inner border-2 border-white dark:border-slate-800" style={pieChartStyle}></div>
            </div>

            {/* الجدول الشهري للمواعيد (عاد من جديد) */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead><tr className="bg-gray-50/50 dark:bg-slate-800 text-gray-500 dark:text-gray-300"><th className="p-4 rounded-r-xl">المريض</th><th className="p-4">الحالة</th><th className="p-4">المبلغ</th><th className="p-4 rounded-l-xl">الوصفة</th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">{monthlyAppointments.filter(a => a.status && a.status !== 'مجدول').map(apt => (
                    <tr key={apt.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-black text-gray-800 dark:text-white">{apt.patient_name}</td>
                      <td className="p-4"><span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${apt.status.includes('مكتمل') ? 'text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300' : 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{apt.status}</span></td>
                      <td className="p-4 font-black text-gray-700 dark:text-gray-300">{apt.price || 0} JD</td>
                      <td className="p-4 text-[#AB9AF7]">{apt.prescription || '-'}</td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          </div>
        </div>

        {/* المواعيد اليومية (القسم الأيسر) */}
        <div className="glass-card rounded-[2rem] p-6 h-fit text-right shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
            <h2 className="text-lg font-black text-gray-800 dark:text-white">مواعيد {selectedDate}</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-md ${showAddForm ? 'bg-red-400' : 'bg-[#AB9AF7]'}`}>{showAddForm ? <XCircle size={18} /> : <Plus size={18} />}</button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAppointment} className="mb-6 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-inner border border-gray-100 dark:border-slate-700 space-y-4">
              <input type="text" list="patients-list" required placeholder="اسم المريضة..." value={newPatientName} onChange={e => setNewPatientName(e.target.value)} className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 rounded-xl outline-none bg-transparent" />
              <datalist id="patients-list">{patientsList.map(p => <option key={p.id} value={p.full_name} />)}</datalist>
              <select value={newTreatmentType} onChange={e => setNewTreatmentType(e.target.value)} className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 rounded-xl outline-none bg-transparent"><option>تنظيف بشرة عميق</option><option>جلسة ليزر</option><option>تقشير كيميائي</option><option>استشارة</option><option>مراجعة</option></select>
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
            {dailyAppointments.map((apt) => (
              <div key={apt.id} className="p-5 border border-white dark:border-slate-700 rounded-2xl bg-white/60 dark:bg-slate-800 border-r-4 border-r-[#AB9AF7] shadow-sm">
                <p className="font-black text-lg text-gray-900 dark:text-white">{apt.patient_name}</p>
                <p className="text-sm text-gray-500 mb-4">{apt.appointment_time} - <span className="text-[#AB9AF7] font-bold">{apt.treatment_type}</span></p>
                
                {editingId === apt.id ? (
                  <div className="mt-4 space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-inner border border-gray-100 dark:border-slate-800">
                    <div className="flex gap-2 mb-3 bg-gray-50 dark:bg-slate-800 p-1 rounded-lg">
                      <button type="button" onClick={() => setTempStatus('مكتمل')} className={`text-xs font-bold w-full py-2 rounded-md ${tempStatus === 'مكتمل' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>مكتمل</button>
                      <button type="button" onClick={() => setTempStatus('مؤجل')} className={`text-xs font-bold w-full py-2 rounded-md ${tempStatus === 'مؤجل' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>مؤجل</button>
                      <button type="button" onClick={() => setTempStatus('ملغي')} className={`text-xs font-bold w-full py-2 rounded-md ${tempStatus === 'ملغي' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400'}`}>ملغي</button>
                    </div>
                    {tempStatus === 'مكتمل' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" placeholder="المبلغ" value={price} className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setPrice(e.target.value)} />
                          <select className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option value="كاش">كاش</option><option value="شبكة">شبكة</option></select>
                        </div>
                        <select className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                          <option value="">-- تخصيص منتج (يخصم من المخزون) --</option>
                          {inventory.map((item, idx) => <option key={idx} value={item.product_name}>{item.product_name} (متوفر: {item.stock})</option>)}
                        </select>
                      </div>
                    )}
                    {tempStatus === 'مؤجل' && (
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input type="date" className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setNewDate(e.target.value)} />
                        <input type="time" className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl outline-none" onChange={e => setNewTime(e.target.value)} />
                      </div>
                    )}
                    <textarea placeholder="ملاحظات الجلسة..." value={noteText} className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-transparent rounded-xl min-h-[80px] outline-none" onChange={e => setNoteText(e.target.value)} />
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => updateAppointmentStatus(apt.id, tempStatus)} className="bg-[#AB9AF7] text-white text-sm py-3 rounded-xl w-full font-black shadow-md hover:bg-[#9685e8]">حفظ</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm py-3 rounded-xl w-full font-bold">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {apt.status?.includes('مكتمل') ? (
                      <div className="mt-4 flex justify-between bg-green-50/80 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/50"><span className="text-xs font-black text-green-700 dark:text-green-400">✅ تم إتمام الجلسة</span><button onClick={() => startEditing(apt)} className="text-green-600"><Edit2 size={16} /></button></div>
                    ) : apt.status === 'مؤجل' ? (
                      <div className="mt-4 flex justify-between bg-yellow-50/80 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/50"><span className="text-xs font-black text-yellow-700 dark:text-yellow-400">⏱ مؤجل</span><button onClick={() => startEditing(apt)} className="text-yellow-600"><Edit2 size={16} /></button></div>
                    ) : apt.status === 'ملغي' ? (
                      <div className="mt-4 flex justify-between bg-red-50/80 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50"><span className="text-xs font-black text-red-700 dark:text-red-400">❌ ملغي</span><button onClick={() => startEditing(apt)} className="text-red-600"><Edit2 size={16} /></button></div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('مكتمل');}} className="text-[11px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-2.5 rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">✔ إتمام</button>
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('مؤجل');}} className="text-[11px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 py-2.5 rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">⏱ تأجيل</button>
                        <button onClick={() => {setEditingId(apt.id); setTempStatus('ملغي');}} className="text-[11px] bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 py-2.5 rounded-xl font-black w-full shadow-sm hover:scale-105 transition-all">✖ إلغاء</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}