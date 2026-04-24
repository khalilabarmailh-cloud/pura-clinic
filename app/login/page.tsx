'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    
    // محاكاة تسجيل الدخول (بدون قاعدة بيانات مؤقتاً للتجربة)
    if (code === '1111') {
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_dept', 'الإدارة');
      localStorage.setItem('user_name', 'المدير العام');
      alert('أهلاً بك يا مدير النظام 👑');
      router.push('/patients-list'); 
    } 
    else if (code === '2222') {
      localStorage.setItem('user_role', 'doctor');
      localStorage.setItem('user_dept', 'طب الأسنان');
      localStorage.setItem('user_name', 'طبيب الأسنان');
      alert('أهلاً دكتور (قسم الأسنان) 🦷');
      router.push('/patients-list');
    }
    else if (code === '3333') {
      localStorage.setItem('user_role', 'doctor');
      localStorage.setItem('user_dept', 'الطب العام');
      localStorage.setItem('user_name', 'طبيب عام');
      alert('أهلاً دكتور (الطب العام) 🩺');
      router.push('/patients-list');
    }
    else if (code === '4444') {
      localStorage.setItem('user_role', 'receptionist');
      localStorage.setItem('user_dept', 'الاستقبال');
      localStorage.setItem('user_name', 'موظف الاستقبال');
      alert('أهلاً بك في قسم الاستقبال 💻');
      router.push('/patients-list');
    }
    else {
      alert("الرمز السري غير صحيح! (جرب 1111, 2222, 3333, 4444)");
      setLoading(false);
      return;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-4" dir="rtl">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center space-y-6 border border-[#AB9AF7]/20">
        <div className="w-20 h-20 bg-[#AB9AF7] rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#AB9AF7]/30">
          <Lock size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-800">Pura Clinic Access</h1>
          <p className="text-gray-500 font-bold mt-2">أدخل الرمز السري الخاص بك للمتابعة</p>
        </div>
        
        {/* دليل سريع للمطور */}
        <div className="bg-blue-50 text-blue-600 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2">
          <ShieldCheck size={16} /> مدير: 1111 | أسنان: 2222 | عام: 3333 | استقبال: 4444
        </div>

        <input 
          type="password" 
          placeholder="****" 
          maxLength={4}
          className="w-full p-5 text-center text-3xl tracking-[1rem] rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#AB9AF7] outline-none transition-all"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#AB9AF7] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : "دخول للنظام"}
        </button>
      </form>
    </div>
  );
}