'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconHome2,
  IconFolder,
  IconCalendarEvent,
  IconSettings,
  IconFileAnalytics,
  IconHelpCircle,
  IconLogout,
  IconHelpCircleFilled,
} from '@tabler/icons-react';

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarLink({ icon: Icon, label, href, active, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors 
        ${active ? 'bg-white text-blue-500 shadow-md' : 'text-white hover:bg-blue-600'}`}
    >
      <Icon size={24} className="flex-shrink-0" />
      <span className="ml-3 text-sm font-medium hidden sm:block">{label}</span>
    </button>
  );
}

const sidebarData = [
  { icon: IconHome2, label: 'Visão Geral', href: '/home' },
  { icon: IconFolder, label: 'Materiais', href: '/materiais' },
  { icon: IconFileAnalytics, label: 'Simulados', href: '/simulados' },
  { icon: IconHelpCircle, label: 'Fórum', href: '/qa' },
  { icon: IconCalendarEvent, label: 'Agenda', href: '/agenda' },
  { icon: IconSettings, label: 'Configurações', href: '/configuracoes' },
  { icon: IconHelpCircleFilled, label: 'Instruções', href: '/instrucoes' },
];

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const activeItem = sidebarData.findIndex((item) => item.href === pathname);
    if (activeItem !== -1) {
      setActiveIndex(activeItem);
    }
  }, [pathname]);

  const handleNavigation = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      } else {
        console.error('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="flex flex-col bg-blue-500 w-20 sm:w-56 min-h-screen py-4 rounded-br-3xl rounded-tr-3xl">
      <div className="flex mt-5 flex-col gap-1 flex-1">
        {sidebarData.map((link, index) => (
          <SidebarLink
            key={link.label}
            icon={link.icon}
            label={link.label}
            href={link.href}
            active={index === activeIndex}
            onClick={() => handleNavigation(link.href!, index)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 px-4">
        <SidebarLink icon={IconLogout} label="Logout" onClick={handleLogout} />
      </div>
    </nav>
  );
}
