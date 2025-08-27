import React, { ReactNode } from 'react';
import { useToggle } from '../../hooks';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, toggleSidebar, setSidebarOpen] = useToggle(false);

  React.useEffect(() => {
    if (title) {
      document.title = `${title} - InvoicePro`;
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-secondary">
      <Header onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
