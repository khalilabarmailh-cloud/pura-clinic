'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserPlus, Users, Package, Receipt } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // الخيارات الخمسة الأصلية كاملة ومكملة
  const menuItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
    { name: 'تسجيل مريض جديد', icon: UserPlus, path: '/add-patient' },
    { name: 'سجل المرضى', icon: Users, path: '/patients-list' },
    { name: 'المخزون', icon: Package, path: '/inventory' },
    { name: 'المصاريف', icon: Receipt, path: '/expenses' },
  ];

  return (
    <aside className="w-64 h-full flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-slate-800 flex flex-col transition-colors duration-300 z-20">
      
      {/* اللوجو */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-[#AB9AF7] drop-shadow-sm">
          Pura Clinic
        </h2>
        <p className="text-xs text-gray-400 font-bold mt-1">الإدارة الذكية</p>
      </div>

      {/* الروابط */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-[#AB9AF7] text-white shadow-md scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[#AB9AF7] dark:hover:text-[#AB9AF7]'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : ''} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}