import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FailureInjectionModal } from './FailureInjectionModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { useMissionStore } from '../store/missionStore';

export const Layout: React.FC = () => {
  const { initWebSocket, fetchMissions } = useMissionStore();

  useEffect(() => {
    fetchMissions();
    initWebSocket();
  }, [fetchMissions, initWebSocket]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a12] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto tactical-grid p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <FailureInjectionModal />
      <TaskDetailDrawer />
    </div>
  );
};
