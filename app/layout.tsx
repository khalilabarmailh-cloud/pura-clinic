import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex h-screen w-full">
            {/* القائمة الجانبية ثابتة على اليمين */}
            <Sidebar />
            
            {/* الداشبورد والمحتوى يأخذ باقي الشاشة ويكون قابل للنزول */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}