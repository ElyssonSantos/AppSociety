import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#1a1a2e] flex flex-col antialiased">
      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pb-20 min-h-screen">
        <div className="max-w-lg md:max-w-xl mx-auto w-full bg-white">
          <Outlet />
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
