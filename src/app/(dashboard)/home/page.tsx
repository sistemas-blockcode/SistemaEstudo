'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconFolder, 
  IconFileAnalytics, 
  IconHelpCircle,
  IconCalendarEvent, 
  IconAlertCircle 
} from '@tabler/icons-react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface DeliveryItemProps {
  item: string;
  date: string;
  isDueSoon: boolean;
}

function DeliveryItem({ item, date, isDueSoon }: DeliveryItemProps) {
  return (
    <div className="flex justify-between text-gray-600 text-md py-2 border-b last:border-b-0">
      <span className="flex items-center gap-2">
        {item} {isDueSoon && <IconAlertCircle size={20} color="red" />}
      </span>
      <div className="border-[1.9px] py-1 px-2 rounded-lg">
        <span className="font-semibold text-black">{date}</span>
      </div>
    </div>
  );
}

interface Event {
  titulo: string;
  descricao: string;
  data: Date;
}

export default function DashboardOverview() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events/getEvents');
        if (!response.ok) throw new Error('Erro ao buscar eventos');
        const data = await response.json();

        const sortedEvents = data
          .map((event: any) => ({
            titulo: event.titulo,
            descricao: event.descricao,
            data: new Date(event.data),
          }))
          .sort((a: Event, b: Event) => a.data.getTime() - b.data.getTime()); 

        setEvents(sortedEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);


  const today = new Date();

  return (
    <div className="p-2 space-y-4">
      {/* Acesso Rápido */}
      <Card title="Acesso Rápido">
        <div className="flex flex-wrap justify-evenly gap-2">
          <button
            className="flex flex-col items-center w-52 h-24 px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => router.push('/materiais')}
          >
            <IconFolder size={32} />
            <span className="mt-2">Materiais</span>
          </button>
          <button
            className="flex flex-col items-center w-52 h-24 px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => router.push('/simulados')}
          >
            <IconFileAnalytics size={32} />
            <span className="mt-2">Simulados</span>
          </button>
          <button
            className="flex flex-col items-center w-52 h-24 px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => router.push('/qa')}
          >
            <IconHelpCircle size={32} />
            <span className="mt-2">Fórum</span>
          </button>
          <button
            className="flex flex-col items-center w-52 h-24 px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => router.push('/agenda')} 
          >
            <IconCalendarEvent size={32} />
            <span className="mt-2">Agenda</span>
          </button>
        </div>
      </Card>

      {/* Próximas Entregas */}
      <Card title="Próximas Entregas">
        {loading ? (
          <div className="text-gray-500 text-center">Carregando entregas...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500 text-center">Nenhuma entrega disponível.</div>
        ) : (
          <div>
            {events.map((event) => {
              const daysToDeadline = Math.ceil(
                (event.data.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <DeliveryItem
                  key={event.titulo + event.data.toISOString()}
                  item={event.titulo}
                  date={event.data.toLocaleDateString('pt-BR')}
                  isDueSoon={daysToDeadline <= 7} 
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
