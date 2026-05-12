import { Outlet } from 'react-router-dom';
import { Rail } from '@/components/layout/Rail';
import { Secondary } from '@/components/layout/Secondary';
import { Topbar } from '@/components/layout/Topbar';
import { Toaster } from '@/components/ui/toast';

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-bg text-text">
      <Rail />
      <Secondary />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-7 py-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
