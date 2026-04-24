'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { LayoutDashboard, Users, UserPlus, Receipt, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // لحل مشكلة الـ Hydration مع الوضع المظلم
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: 'لوحة التحكم', path: '/', icon: <Calendar size={22} /> },
    { name: 'سجل المراجعين', path: '/patients-list', icon: <Users size={22} /> },
    { name: 'إضافة مراجع', path: '/add-patient', icon: <UserPlus size={22} /> },
    { name: 'المصاريف', path: '/expenses', icon: <Receipt size={22} /> },
  ];

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans transition-colors duration-300">
        {/* إضافة مزود الثيم لتفعيل الوضع المظلم */}
        <ThemeProvider attribute="class" defaultTheme="light">
          {/* الخلفية تتغير حسب الوضع (فاتح/مظلم) */}
          <div className="flex h-screen overflow-hidden bg-[#F8F7FF] dark:bg-slate-900">
            
            {/* ================== القائمة الجانبية (Sidebar) ================== */}
            {/* تم تصغير العرض في حالة الإغلاق إلى w-16 بدل w-20 */}
            <aside className={`bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300 ease-in-out relative flex flex-col z-20 border-l border-gray-100 dark:border-slate-700 ${isCollapsed ? 'w-16' : 'w-64'}`}>
              
              {/* زر الطي والفتح */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -left-3.5 top-10 bg-[#AB9AF7] text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-all z-30 flex items-center justify-center"
              >
                {isCollapsed ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
              </button>

              {/* منطقة الشعار (اللوجو) */}
              <div className="h-24 flex items-center justify-center border-b border-gray-50 dark:border-slate-700">
                <h2 className={`font-black text-[#AB9AF7] transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 text-2xl'}`}>
                  Pura Clinic
                </h2>
                {isCollapsed && <span className="font-black text-2xl text-[#AB9AF7] absolute">P</span>}
              </div>

              {/* أزرار القائمة (الروابط) */}
              <nav className="flex-1 px-2 sm:px-3 py-6 space-y-3 overflow-y-auto">
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

            {/* ================== المحتوى الرئيسي (الصفحات) ================== */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* نتأكد من تحميل الثيم قبل عرض المحتوى لمنع الوميض */}
              {mounted && children}
            </main>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}