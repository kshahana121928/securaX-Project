import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { CountdownModal } from '../modals/CountdownModal';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
      <CountdownModal />
    </div>
  );
};
