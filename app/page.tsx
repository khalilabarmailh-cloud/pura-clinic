// app/page.tsx
import CalendarDashboard from '@/components/CalendarDashboard';

export default function Home() {
  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">الرئيسية (الرزنامة) ✨</h2>
        <p className="text-gray-500 mt-1">نظرة عامة على مواعيد اليوم.</p>
      </header>
      <CalendarDashboard />
    </div>
  );
}