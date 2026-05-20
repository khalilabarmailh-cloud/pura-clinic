'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { LayoutDashboard, Users, UserPlus, Receipt, ChevronRight, ChevronLeft, Calendar, Package, Lock } from 'lucide-react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // ================= حالات شاشة القفل =================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  // 💡 هون بتقدر تغير الرمز السري لأي رقم بدك إياه
  const CORRECT_PASSCODE = "200557";

  // لحل مشكلة الـ Hydration وفحص تسجيل الدخول
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('pura_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    
    // الترجمة الذكية: تحويل الأرقام العربية إلى إنجليزية
    const englishPasscode = passcode.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

    if (englishPasscode === CORRECT_PASSCODE) {
      localStorage.setItem('pura_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasscode(''); // تفريغ الخانة إذا كان الرمز غلط
    }
  };

  const menuItems = [
    { name: 'لوحة التحكم', path: '/', icon: <Calendar size={22} /> },
    { name: 'سجل المراجعين', path: '/patients-list', icon: <Users size={22} /> },
    { name: 'إضافة مراجع', path: '/add-patient', icon: <UserPlus size={22} /> },
    { name: 'المخزون', path: '/inventory', icon: <Package size={22} /> },
    { name: 'المصاريف', path: '/expenses', icon: <Receipt size={22} /> },
  ];

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans transition-colors duration-300 bg-[#F8F7FF] dark:bg-slate-900">
        <ThemeProvider attribute="class" defaultTheme="light">
          
          {/* هنا تم نقل شرط التحميل ليكون بداخل الـ Body لتجنب الخطأ */}
          {!mounted ? (
            <div className="h-screen bg-[#F8F7FF] dark:bg-slate-900"></div>
          ) : !isAuthenticated ? (
            /* ================== شاشة القفل ================== */
            <div className="flex h-screen items-center justify-center p-4">
              <form onSubmit={handleLogin} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-gray-100 dark:border-slate-700 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-2 bg-[#AB9AF7]"></div>
                
                <div className="w-16 h-16 bg-[#AB9AF7]/10 text-[#AB9AF7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} />
                </div>
                
                <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Pura Clinic</h1>
                <p className="text-sm text-gray-500 font-bold mb-8">الرجاء إدخال رمز الدخول للنظام</p>

                <input
                  type="password"
                  placeholder="•••••"
                  className={`w-full p-4 text-center text-2xl tracking-[0.5em] rounded-xl border ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900'} outline-none focus:border-[#AB9AF7] transition-all mb-4 font-black`}
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setError(false); }}
                  autoFocus
                />

                {error && <p className="text-xs text-red-500 font-bold mb-4 animate-pulse">الرمز غير صحيح، حاول مرة أخرى!</p>}

                <button type="submit" className="w-full bg-[#AB9AF7] text-white p-4 rounded-xl font-black shadow-lg hover:bg-[#9685e8] transition-all hover:scale-[1.02]">
                  دخول آمن
                </button>
              </form>
            </div>
          ) : (
            /* ================== النظام الداخلي ================== */
            <div className="flex h-screen overflow-hidden bg-[#F8F7FF] dark:bg-slate-900">
              
              <aside className={`hidden md:flex flex-col bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300 ease-in-out relative z-20 border-l border-gray-100 dark:border-slate-700 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="absolute -left-3.5 top-10 bg-[#AB9AF7] text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-all z-30 flex items-center justify-center"
                >
                  {isCollapsed ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
                </button>

                <div className="h-24 flex items-center justify-center border-b border-gray-50 dark:border-slate-700">
                  <h2 className={`font-black text-[#AB9AF7] transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 text-2xl'}`}>
                    Pura Clinic
                  </h2>
                  {isCollapsed && <span className="font-black text-2xl text-[#AB9AF7] absolute">P</span>}
                </div>

                <nav className="flex-1 px-2 py-6 space-y-3 overflow-y-auto">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link key={item.path} href={item.path}
                        title={isCollapsed ? item.name : ''}
                        className={`flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                          isActive 
                          ? 'bg-[#AB9AF7] text-white shadow-md' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-[#AB9AF7]/10 dark:hover:bg-slate-700 hover:text-[#AB9AF7]'
                        } ${isCollapsed ? 'justify-center' : 'gap-4'}`}
                      >
                        <div className={`${isCollapsed ? 'mx-auto' : ''}`}>{item.icon}</div>
                        
                        <span className={`font-bold whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>

              <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
                {children}
              </main>

              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center px-2 py-3 pb-safe">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link key={item.path} href={item.path} className={`flex flex-col items-center transition-all ${isActive ? 'text-[#AB9AF7]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                      <div className={`${isActive ? 'bg-[#AB9AF7]/10 p-2 rounded-xl' : 'p-2'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-[9px] font-black mt-1 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

            </div>
          )}

        </ThemeProvider>
      </body>
    </html>
  );
}