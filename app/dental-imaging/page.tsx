'use client';
import { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Maximize2, Columns, Trash2, Calendar, FileText, X } from 'lucide-react';

// بيانات وهمية مؤقتة لتجربة شكل المعرض (روابط صور طبية تقريبية)
const MOCK_IMAGES = [
  { id: 1, type: 'أشعة بانوراما (Panoramic)', date: '2026-04-10', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop', notes: 'فحص روتيني شامل يوضح نمو أضراس العقل' },
  { id: 2, type: 'صورة فوتوغرافية (قبل)', date: '2026-02-15', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop', notes: 'تراجع في اللثة وتصبغات قبل البدء بخطة العلاج' },
  { id: 3, type: 'صورة فوتوغرافية (بعد)', date: '2026-04-18', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop', notes: 'النتيجة النهائية بعد تركيب الفينير (Veneers)' },
  { id: 4, type: 'أشعة ذروية (Periapical)', date: '2026-03-05', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop', notes: 'صورة لتقييم عمق حشوة العصب للسن رقم 24' },
];

export default function ImagingGallery() {
  const [images, setImages] = useState(MOCK_IMAGES);
  
  // حالات عارض الصور
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  // حالات وضع المقارنة (Compare Mode)
  const [compareMode, setCompareMode] = useState(false);
  const [compareImage1, setCompareImage1] = useState<any>(null);
  const [compareImage2, setCompareImage2] = useState<any>(null);

  // دالة لاختيار الصور في وضع المقارنة
  const handleImageClick = (img: any) => {
    if (compareMode) {
      if (!compareImage1) setCompareImage1(img);
      else if (!compareImage2 && img.id !== compareImage1.id) setCompareImage2(img);
    } else {
      setSelectedImage(img);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareImage1(null);
    setCompareImage2(null);
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* الترويسة العلوية */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#AB9AF7] flex items-center gap-3">
            <ImageIcon size={32} /> معرض الأشعة والصور
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">المراجع: أحمد محمود | الملف: DENT-2026</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleCompareMode}
            className={`px-6 py-3 rounded-xl font-black shadow-sm transition-all flex items-center gap-2 ${compareMode ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'}`}
          >
            <Columns size={20} /> {compareMode ? 'إلغاء وضع المقارنة' : 'مقارنة (قبل/بعد)'}
          </button>
          <button className="bg-[#AB9AF7] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <UploadCloud size={20} /> رفع صورة جديدة
          </button>
        </div>
      </div>

      {/* لوحة المقارنة (تظهر فقط عند تفعيل وضع المقارنة) */}
      {compareMode && (
        <div className="glass-card p-6 rounded-[2rem] shadow-sm border-2 border-orange-400 bg-orange-50/30 dark:bg-orange-900/10">
          <h2 className="text-xl font-black text-orange-600 dark:text-orange-400 mb-4 text-center">
            {compareImage1 && compareImage2 ? 'نتيجة المقارنة' : 'اختر صورتين من المعرض بالأسفل للمقارنة'}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 h-[400px]">
            {/* الصورة الأولى (قبل) */}
            <div className="relative rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-slate-800/50">
              {compareImage1 ? (
                <>
                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold z-10">الصورة الأولى</span>
                  <img src={compareImage1.url} alt="img1" className="w-full h-full object-cover" />
                  <button onClick={() => setCompareImage1(null)} className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-all z-10"><X size={16} /></button>
                </>
              ) : (
                <span className="text-gray-400 font-bold">1️⃣ اختر الصورة الأولى</span>
              )}
            </div>
            
            {/* الصورة الثانية (بعد) */}
            <div className="relative rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-slate-800/50">
              {compareImage2 ? (
                <>
                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold z-10">الصورة الثانية</span>
                  <img src={compareImage2.url} alt="img2" className="w-full h-full object-cover" />
                  <button onClick={() => setCompareImage2(null)} className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-all z-10"><X size={16} /></button>
                </>
              ) : (
                <span className="text-gray-400 font-bold">2️⃣ اختر الصورة الثانية</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* شبكة الصور (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map(img => (
          <div 
            key={img.id} 
            onClick={() => handleImageClick(img)}
            className={`glass-card rounded-[1.5rem] overflow-hidden shadow-sm border transition-all cursor-pointer group ${
              (compareImage1?.id === img.id || compareImage2?.id === img.id) 
                ? 'border-orange-500 ring-4 ring-orange-500/20 scale-[1.02]' 
                : 'border-gray-100 dark:border-slate-700 hover:border-[#AB9AF7] hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            {/* عرض الصورة */}
            <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-slate-800">
              <img src={img.url} alt={img.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              
              {/* أيقونة التكبير تظهر عند الـ Hover */}
              {!compareMode && (
                <div className="absolute inset-0 bg-[#AB9AF7]/0 group-hover:bg-[#AB9AF7]/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white text-[#AB9AF7] p-3 rounded-full shadow-lg"><Maximize2 size={24} /></div>
                </div>
              )}
              
              {/* بادج نوع الصورة */}
              <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[#AB9AF7] px-3 py-1 rounded-lg text-[10px] font-black shadow-sm">
                {img.type}
              </span>
            </div>

            {/* تفاصيل الصورة */}
            <div className="p-4 bg-white/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-bold mb-2">
                <Calendar size={14} /> {img.date}
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">
                {img.notes}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* عارض الصور المكبر (Modal) */}
      {selectedImage && !compareMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            
            {/* زر الإغلاق */}
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors z-10">
              <X size={24} />
            </button>

            {/* مساحة الصورة */}
            <div className="w-full md:w-2/3 bg-gray-100 dark:bg-black h-[400px] md:h-[600px] flex items-center justify-center">
              <img src={selectedImage.url} alt={selectedImage.type} className="max-w-full max-h-full object-contain" />
            </div>

            {/* مساحة التفاصيل */}
            <div className="w-full md:w-1/3 p-8 border-r dark:border-slate-800">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">تفاصيل الصورة</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 flex items-center gap-1"><ImageIcon size={14}/> نوع الصورة</label>
                  <p className="font-bold text-lg text-[#AB9AF7]">{selectedImage.type}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 flex items-center gap-1"><Calendar size={14}/> تاريخ الالتقاط</label>
                  <p className="font-bold text-gray-700 dark:text-gray-200">{selectedImage.date}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 flex items-center gap-1"><FileText size={14}/> ملاحظات الطبيب</label>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedImage.notes}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t dark:border-slate-800">
                <button className="w-full py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={18} /> حذف الصورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}