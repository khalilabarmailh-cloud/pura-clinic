'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  AlertCircle, Thermometer, HeartPulse, Weight, Activity, 
  Stethoscope, Pill, Save, User, Moon, Sun, TestTubes, 
  FileImage, Plus, Trash2, Send, Receipt, X, Loader2, ImagePlus, ClipboardList, ZoomIn
} from 'lucide-react';

export default function GeneralPracticeDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  // حالات البيانات
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temp: '', weight: 0, height: 0, gender: 'ذكر' });
  const [medications, setMedications] = useState<{name: string, dosage: string, duration: string}[]>([]);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', duration: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const availableServices = ['كشفية عامة', 'فحص سكر', 'تخطيط قلب (ECG)', 'غيار جرح', 'إبرة عضلية'];
  const [referral, setReferral] = useState('');
  const [labResults, setLabResults] = useState<{name: string, result: string, notes: string}[]>([]);
  const [newLab, setNewLab] = useState({ name: '', result: '', notes: '' });
  const [imagingRecords, setImagingRecords] = useState<{type: string, report: string, filePreview: string | null, file: File | null}[]>([]);
  const [newImage, setNewImage] = useState<{type: string, report: string, filePreview: string | null, file: File | null}>({ type: '', report: '', filePreview: null, file: null });

  const calculateBMI = () => {
    if (vitals.weight > 0 && vitals.height > 0) {
      const heightInMeters = vitals.height / 100;
      return (vitals.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return '--';
  };

  const uploadImageToSupabase = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `radiology/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('medical-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('medical-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      return null;
    }
  };

  const handleSaveAllData = async () => {
    if (!diagnosis) {
      alert("يرجى إدخال التشخيص قبل الحفظ.");
      return;
    }
    setIsSaving(true);
    try {
      const processedImagingRecords = await Promise.all(
        imagingRecords.map(async (img) => {
          let publicUrl = null;
          if (img.file) publicUrl = await uploadImageToSupabase(img.file);
          return { type: img.type, report: img.report, image_url: publicUrl };
        })
      );
      const finalData = {
        patient_id: 1, doctor_id: 1,  
        vitals: { ...vitals, bmi: calculateBMI() },
        chief_complaint: chiefComplaint, clinical_notes: clinicalNotes, diagnosis: diagnosis,
        medications: medications, services: selectedServices, referral_to: referral || null,
        lab_imaging_refs: { labs: labResults, imaging: processedImagingRecords }
      };
      const { error } = await supabase.from('general_records').insert([finalData]);
      if (error) throw error;
      alert('تم تسجيل الزيارة ورفع الصور بكفاءة بنجاح!');
      setChiefComplaint(''); setClinicalNotes(''); setDiagnosis(''); setMedications([]); setSelectedServices([]); setLabResults([]); setImagingRecords([]);
    } catch (error: any) {
      alert('خطأ أثناء التسجيل: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addMedication = () => { if (newMed.name) { setMedications([...medications, newMed]); setNewMed({ name: '', dosage: '', duration: '' }); setIsMedModalOpen(false); } };
  const addLabResult = () => { if (newLab.name.trim()) { setLabResults([...labResults, newLab]); setNewLab({ name: '', result: '', notes: '' }); } };
  const addImagingRecord = () => { if (newImage.type.trim() || newImage.file) { setImagingRecords([...imagingRecords, newImage]); setNewImage({ type: '', report: '', filePreview: null, file: null }); } };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewImage({ ...newImage, file, filePreview: previewUrl });
    }
  };

  const toggleService = (service: string) => { setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]); };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#0F172A] p-8 transition-colors duration-300" dir="rtl">
        
        <div className="fixed top-8 left-8 z-40">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white dark:border-white/20 text-[#AB9AF7] transition-all hover:scale-110">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <header className="mb-8">
          <div className="flex justify-between items-center bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#AB9AF7]/20 rounded-3xl flex items-center justify-center text-[#AB9AF7]"><User size={32} /></div>
              <div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white">أحمد محمد</h1>
                <div className="flex gap-3 text-gray-500 dark:text-gray-400 mt-1 font-bold">
                  <span>العمر: 34 سنة</span> | <span className="text-[#AB9AF7]">الجنس: {vitals.gender}</span> | <span>رقم الملف: #10294</span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
              <AlertCircle className="text-red-500" size={24} />
              <span className="text-red-700 dark:text-red-400 font-bold text-sm">حساسية: البنسلين</span>
            </div>
          </div>
        </header>

        {/* ----------------- التقرير الشامل المكبر (Live Summary) ----------------- */}
        <div className="mb-10 bg-white/90 dark:bg-slate-800/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-xl border-2 border-[#AB9AF7]/40 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AB9AF7]/10 rounded-bl-full -z-10"></div>
          
          <h2 className="text-3xl font-black text-[#AB9AF7] mb-8 flex items-center gap-3">
            <ClipboardList size={32} /> التقرير الطبي الشامل (معاينة حية)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* 1. التقييم والتشخيص */}
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-black text-gray-800 dark:text-gray-200 mb-4 text-lg flex items-center gap-2">
                <Stethoscope size={20} className="text-[#AB9AF7]" /> التقييم السريري
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">الشكوى الرئيسية:</span>
                  <p className="text-base text-gray-800 dark:text-white font-bold mt-1 leading-snug">{chiefComplaint || '--'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">التشخيص النهائي:</span>
                  <p className="text-base text-[#AB9AF7] font-black mt-1 bg-[#AB9AF7]/10 p-2 rounded-xl inline-block">{diagnosis || '--'}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-center">الضغط: {vitals.bp || '-'}</div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-center">الحرارة: {vitals.temp || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. الفحوصات المخبرية (قسم مستقل ومكبر) */}
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-black text-gray-800 dark:text-gray-200 mb-4 text-lg flex items-center gap-2">
                <TestTubes size={20} className="text-[#AB9AF7]" /> الفحوصات المخبرية
              </h3>
              <div className="space-y-3">
                {labResults.length > 0 ? labResults.map((lab, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-base font-bold text-gray-800 dark:text-white">{lab.name}</p>
                    <p className="text-sm text-[#AB9AF7] font-bold mt-1">{lab.result}</p>
                  </div>
                )) : <div className="h-24 flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">لم يتم إدراج فحوصات</div>}
              </div>
            </div>

            {/* 3. الأشعة والصور (قسم مستقل) */}
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-black text-gray-800 dark:text-gray-200 mb-4 text-lg flex items-center gap-2">
                <FileImage size={20} className="text-[#AB9AF7]" /> صور الأشعة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {imagingRecords.length > 0 ? imagingRecords.map((img, i) => (
                  <div key={i} className="relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm" onClick={() => img.filePreview && setEnlargedImage(img.filePreview)}>
                    {img.filePreview ? (
                      <>
                        <img src={img.filePreview} alt="ray" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#AB9AF7]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                          <ZoomIn className="text-white" size={28} />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        <FileImage size={24} className="mb-2" />
                        <span className="text-xs font-bold truncate w-full">{img.type}</span>
                      </div>
                    )}
                  </div>
                )) : <div className="col-span-2 h-24 flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">لم يتم إرفاق صور</div>}
              </div>
            </div>

            {/* 4. الخطة العلاجية والخدمات */}
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-black text-gray-800 dark:text-gray-200 mb-4 text-lg flex items-center gap-2">
                <Receipt size={20} className="text-[#AB9AF7]" /> الخطة والخدمات
              </h3>
              <div className="space-y-4">
                {/* الأدوية */}
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-bold">الوصفة الطبية:</h4>
                  {medications.length > 0 ? (
                    <div className="space-y-2">
                      {medications.map((med, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 p-2 rounded-xl">
                          <Pill size={16} className="text-[#AB9AF7]" />
                          <span className="font-bold text-gray-800 dark:text-white truncate">{med.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-400">لا يوجد أدوية</p>}
                </div>
                
                {/* الخدمات */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-bold">للمحاسبة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.length > 0 ? selectedServices.map((srv, i) => (
                      <span key={i} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-3 py-1.5 rounded-xl font-bold border border-green-200 dark:border-green-800/50">{srv}</span>
                    )) : <p className="text-xs text-gray-400">لم يتم تحديد خدمات</p>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ----------------- منطقة التعديل والإضافة ----------------- */}
        <div className="flex items-center gap-4 mb-6 opacity-70">
          <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
          <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 tracking-wide">إدخال البيانات السريرية</h2>
          <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="space-y-8">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
              <h2 className="text-xl font-bold text-[#AB9AF7] mb-4 flex items-center gap-2"><Stethoscope size={20} /> إضافة شكوى</h2>
              <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-gray-700 dark:text-gray-300 border border-gray-50 dark:border-white/5 outline-none focus:border-[#AB9AF7] resize-none" rows={3} placeholder="اكتب الشكوى هنا لتظهر في التقرير..."></textarea>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
              <h2 className="text-xl font-bold text-[#AB9AF7] mb-4 flex items-center gap-2"><Activity size={20} /> تسجيل العلامات الحيوية</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-white/5">
                  <HeartPulse className="text-rose-400" />
                  <input type="text" placeholder="الضغط (120/80)" className="w-full outline-none bg-transparent dark:text-white" value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} />
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-white/5">
                  <Thermometer className="text-orange-400" />
                  <input type="text" placeholder="الحرارة (C°)" className="w-full outline-none bg-transparent dark:text-white" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} />
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-white/5">
                  <Weight className="text-blue-400" />
                  <div className="flex gap-2 w-full">
                    <input type="number" placeholder="الوزن (kg)" className="w-1/2 outline-none bg-transparent border-l border-gray-100 dark:border-gray-700 pl-2 dark:text-white" onChange={(e) => setVitals({...vitals, weight: parseFloat(e.target.value) || 0})} />
                    <input type="number" placeholder="الطول (cm)" className="w-1/2 outline-none bg-transparent pr-2 dark:text-white" onChange={(e) => setVitals({...vitals, height: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2 space-y-8">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
              <h2 className="text-xl font-bold text-[#AB9AF7] mb-4">الملاحظات السريرية التفصيلية</h2>
              <textarea rows={3} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} className="w-full bg-white dark:bg-slate-800/50 rounded-3xl p-4 outline-none resize-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] dark:text-white" placeholder="اكتب الملاحظات الطبية..."></textarea>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* إضافة المختبر */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
                <h2 className="text-xl font-bold text-[#AB9AF7] mb-4 flex items-center gap-2"><TestTubes size={20} /> إضافة نتيجة مختبر</h2>
                <div className="flex flex-col gap-3 mb-6">
                  <input type="text" value={newLab.name} onChange={(e) => setNewLab({...newLab, name: e.target.value})} placeholder="اسم الفحص..." className="w-full bg-white dark:bg-slate-800/50 rounded-xl p-3 outline-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] dark:text-white" />
                  <textarea value={newLab.result} onChange={(e) => setNewLab({...newLab, result: e.target.value})} placeholder="النتيجة التفصيلية..." rows={2} className="w-full bg-white dark:bg-slate-800/50 rounded-xl p-3 outline-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] dark:text-white resize-none"></textarea>
                  <button onClick={addLabResult} className="bg-[#AB9AF7] text-white py-3 rounded-xl hover:bg-[#9782F5] transition-colors font-bold w-full mt-2">إضافة للتقرير</button>
                </div>
                <div className="space-y-3">
                  {labResults.map((lab, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-white/5">
                      <span className="font-bold text-gray-800 dark:text-white text-sm">{lab.name}</span>
                      <button onClick={() => setLabResults(labResults.filter((_, i) => i !== idx))} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* إضافة الأشعة والصور */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
                <h2 className="text-xl font-bold text-[#AB9AF7] mb-4 flex items-center gap-2"><FileImage size={20} /> إضافة وتقييم الأشعة</h2>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex gap-3">
                    <label className="flex-shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-[#AB9AF7] text-[#AB9AF7] cursor-pointer flex items-center justify-center hover:bg-[#AB9AF7]/10 transition-colors shadow-sm relative overflow-hidden">
                      {newImage.filePreview ? <img src={newImage.filePreview} className="w-full h-full object-cover" /> : <ImagePlus size={24} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <input type="text" value={newImage.type} onChange={(e) => setNewImage({...newImage, type: e.target.value})} placeholder="نوع الصورة..." className="flex-1 bg-white dark:bg-slate-800/50 rounded-xl p-3 outline-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] dark:text-white" />
                  </div>
                  <textarea value={newImage.report} onChange={(e) => setNewImage({...newImage, report: e.target.value})} placeholder="اكتب التقرير الكامل للصورة..." rows={3} className="w-full bg-white dark:bg-slate-800/50 rounded-xl p-3 outline-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] dark:text-white resize-none"></textarea>
                  <button onClick={addImagingRecord} className="bg-[#AB9AF7] text-white py-3 rounded-xl hover:bg-[#9782F5] transition-colors font-bold w-full mt-2">إضافة الصورة للتقرير</button>
                </div>
                <div className="space-y-3">
                  {imagingRecords.map((img, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-white/5">
                      <div className="flex gap-4 items-center">
                        {img.filePreview && <img src={img.filePreview} className="w-12 h-12 object-cover rounded-lg cursor-pointer" onClick={() => setEnlargedImage(img.filePreview)} />}
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{img.type}</span>
                      </div>
                      <button onClick={() => setImagingRecords(imagingRecords.filter((_, i) => i !== idx))} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
               <h2 className="text-xl font-bold text-[#AB9AF7] mb-4 flex items-center gap-2"><Receipt size={20} /> تحديد الخدمات المقدمة</h2>
              <div className="flex flex-wrap gap-3">
                {availableServices.map(service => (
                  <button key={service} onClick={() => toggleService(service)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedServices.includes(service) ? 'bg-[#AB9AF7] text-white border-[#AB9AF7] shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-[#AB9AF7]'}`}>
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white dark:border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#AB9AF7] flex items-center gap-2"><Pill size={20} /> التشخيص والوصفة الطبية</h2>
                <button onClick={() => setIsMedModalOpen(true)} className="text-sm bg-[#AB9AF7]/10 text-[#AB9AF7] px-4 py-2 rounded-xl font-bold hover:bg-[#AB9AF7]/20 transition-colors">+ إضافة دواء</button>
              </div>
              <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="التشخيص النهائي الأساسي" className="w-full bg-white dark:bg-slate-800/50 rounded-2xl p-4 outline-none border border-gray-100 dark:border-white/5 focus:border-[#AB9AF7] mb-4 dark:text-white font-bold" />
              <div className="space-y-3">
                {medications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                      <div><h3 className="font-bold text-gray-800 dark:text-white">{med.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{med.dosage} - {med.duration}</p></div>
                      <button onClick={() => setMedications(medications.filter((_, i) => i !== idx))} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-colors"><Trash2 size={20} /></button>
                    </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Send size={20} /> تحويل إلى:</span>
            <select value={referral} onChange={(e) => setReferral(e.target.value)} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-[#AB9AF7] dark:text-white font-bold cursor-pointer">
              <option value="">بدون تحويل</option><option value="dental">عيادة طب الأسنان</option><option value="derma">عيادة جلدية وتجميل</option>
            </select>
          </div>
          <button onClick={handleSaveAllData} disabled={isSaving} className="px-8 py-4 bg-[#AB9AF7] text-white rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} {isSaving ? 'جاري الحفظ...' : 'اعتماد التقرير وإنهاء الزيارة'}
          </button>
        </div>
      </div>

      {/* نوافذ العرض */}
      {enlargedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setEnlargedImage(null)}>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
            <button onClick={() => setEnlargedImage(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-2xl text-white backdrop-blur-md transition-all z-50">
              <X size={32} />
            </button>
            <img src={enlargedImage} alt="Enlarged Medical" className="max-w-full max-h-[90vh] rounded-[2rem] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#AB9AF7] flex items-center gap-2"><Pill size={24} /> إضافة دواء</h3>
              <button onClick={() => setIsMedModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="اسم الدواء..." value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 outline-none border border-gray-200 dark:border-gray-700 focus:border-[#AB9AF7] dark:text-white font-medium" />
              <input type="text" placeholder="الجرعة..." value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 outline-none border border-gray-200 dark:border-gray-700 focus:border-[#AB9AF7] dark:text-white font-medium" />
              <input type="text" placeholder="المدة..." value={newMed.duration} onChange={(e) => setNewMed({...newMed, duration: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 outline-none border border-gray-200 dark:border-gray-700 focus:border-[#AB9AF7] dark:text-white font-medium" />
            </div>
            <button onClick={addMedication} className="w-full mt-8 py-4 rounded-2xl font-black text-white bg-[#AB9AF7] shadow-lg hover:-translate-y-1 transition-all">تثبيت الدواء</button>
          </div>
        </div>
      )}
    </div>
  );
}