import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60">
        <Header />
        <main className="flex-1 overflow-auto pt-14 lg:pt-16 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}