'use client';
import {
  IconHome2,
  IconFolder,
  IconFileAnalytics,
  IconHelpCircle,
  IconCalendarEvent,
  IconSettings,
} from '@tabler/icons-react';

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function SectionCard({ icon: Icon, title, description }: SectionProps) {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-start p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition">
      {/* Icon */}
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full">
        <Icon size={28} className="text-blue-500" />
      </div>

      {/* Content */}
      <div className="mt-3 md:mt-0 md:ml-4 text-center md:text-left">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function InstructionsPage() {
  const sections = [
    {
      icon: IconHome2,
      title: 'Visão Geral',
      description: 'Fornece um resumo completo do seu progresso e atividades recentes na plataforma.',
    },
    {
      icon: IconFolder,
      title: 'Materiais',
      description: 'Acesse conteúdos organizados, como PDFs, vídeos e links úteis para os seus estudos.',
    },
    {
      icon: IconFileAnalytics,
      title: 'Simulados',
      description: 'Teste seus conhecimentos com questões e acompanhe seu desempenho ao longo do tempo.',
    },
    {
      icon: IconHelpCircle,
      title: 'Fórum',
      description: 'Faça perguntas, compartilhe conhecimento e interaja com outros usuários da plataforma.',
    },
    {
      icon: IconCalendarEvent,
      title: 'Agenda',
      description: 'Organize suas tarefas e compromissos para gerenciar melhor o seu tempo.',
    },
    {
      icon: IconSettings,
      title: 'Configurações',
      description: 'Personalize suas preferências, altere dados do perfil e gerencie notificações.',
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-100 rounded-lg">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">
        Como funciona a plataforma?
      </h1>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <SectionCard
            key={section.title}
            icon={section.icon}
            title={section.title}
            description={section.description}
          />
        ))}
      </div>
    </div>
  );
}
