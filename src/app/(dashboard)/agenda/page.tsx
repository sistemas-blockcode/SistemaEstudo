'use client';
import { useState, useEffect, Fragment } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profile, setProfile] = useState<{ id: string; nome: string; tipo: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<
    { id: string; title: string; allDay: boolean; start: Date; end: Date }[]
  >([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);
  const [newTask, setNewTask] = useState({ title: '', date: '' });
  const { toast } = useToast();


  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar perfil');
        const data = await response.json();
        setProfile({ id: data.id, nome: data.nome, tipo: data.tipo });
      } catch (error) {
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do perfil.",
          variant: "destructive",
        });
      }
    }

    async function fetchEvents() {
      try {
        const response = await fetch('/api/events/getEvents');
        if (!response.ok) throw new Error('Erro ao buscar eventos');
        const data = await response.json();
        setEvents(
          data.map((event: any) => ({
            id: event.id,
            title: event.titulo,
            allDay: true,
            start: new Date(event.data),
            end: new Date(event.data),
          }))
        );
      } catch (error) {
        toast({
          title: "Erro ao carregar eventos",
          description: "Não foi possível carregar os eventos.",
          variant: "destructive",
        });
      }
    }

    fetchProfile();
    fetchEvents();
    setLoading(false);
  }, []);

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (action === 'NEXT') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date());
    }
  };

  const handleAddTask = async () => {
    if (!profile) {
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    if (!newTask.title || !newTask.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e data são obrigatórios para adicionar uma tarefa.",
        variant: "destructive",
      });
      return;
    }

    try {
      const [day, month, year] = newTask.date.split('/').map(Number);
      const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const response = await fetch('/api/events/addEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: '',
          date: isoDate,
          userId: profile.id,
        }),
      });

      if (!response.ok) throw new Error('Erro ao adicionar evento.');

      const newEvent = await response.json();

      const adjustedStart = new Date(newEvent.data);
      adjustedStart.setDate(adjustedStart.getDate() + 1);

      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: newEvent.id,
          title: newEvent.titulo,
          allDay: true,
          start: adjustedStart,
          end: adjustedStart,
        },
      ]);

      toast({
        title: "Tarefa adicionada",
        description: "A tarefa foi adicionada com sucesso ao calendário.",
        variant: "success",
      });

      setIsAddTaskModalOpen(false);
      setNewTask({ title: '', date: '' });
    } catch (error) {
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Não foi possível adicionar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleSelectEvent = (event: { id: string; title: string }) => {
    if (profile?.tipo === 'ADMIN') {
      setSelectedEvent(event);
    }
  };

  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      toast({
        title: "Erro ao excluir evento",
        description: "ID do evento não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/events/deleteEvent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) throw new Error('Erro ao excluir o evento.');

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      setSelectedEvent(null);

      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const CustomToolbar = ({ label }: { label: string }) => (
    <div className="flex justify-between items-center mb-4">
      <div>
        <button
          onClick={() => handleNavigate('PREV')}
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Anterior
        </button>
        <span className="mx-4 text-lg font-semibold">{label}</span>
        <button
          onClick={() => handleNavigate('NEXT')}
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Próximo
        </button>
      </div>
      {profile?.tipo === 'ADMIN' && (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          Adicionar Tarefa
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-5xl p-4 bg-white rounded-lg shadow-md h-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', width: '100%' }}
          className="h-full"
          defaultView="month"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          onSelectEvent={(event) => handleSelectEvent(event)}
          components={{
            toolbar: CustomToolbar,
          }}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'Não há eventos neste intervalo.',
          }}
          formats={{
            weekdayFormat: (date) => format(date, 'EEEE', { locale: ptBR }),
            monthHeaderFormat: (date) => format(date, 'MMMM yyyy', { locale: ptBR }),
            dayHeaderFormat: (date) => format(date, 'EEEE, dd MMMM', { locale: ptBR }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'dd MMMM', { locale: ptBR })} - ${format(
                end,
                'dd MMMM yyyy',
                { locale: ptBR }
              )}`,
          }}
        />
      </div>

      {/* Modal for Add Task */}
      <Transition appear show={isAddTaskModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddTaskModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Adicionar Tarefa
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Título da tarefa"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      className="w-full p-2 mt-4 border border-gray-300 rounded-md"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                      onClick={handleAddTask}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="ml-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAddTaskModalOpen(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal for Confirm Delete */}
      <Transition appear show={!!selectedEvent} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setSelectedEvent(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirmar Exclusão
                  </Dialog.Title>
                  <div className="mt-2">
                    <p>Deseja excluir a tarefa "{selectedEvent?.title}"?</p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 ml-4"
                      onClick={() => handleDeleteEvent(selectedEvent?.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
