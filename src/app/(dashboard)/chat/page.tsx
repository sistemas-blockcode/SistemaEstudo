'use client';
import { useState, useEffect } from 'react';
import { IconUserCircle } from '@tabler/icons-react';

interface ChatContact {
  id: number;
  name: string;
  lastMessage: string;
}

const contacts: ChatContact[] = [
  { id: 1, name: 'Matemática', lastMessage: 'Última mensagem...' },
  { id: 2, name: 'Física', lastMessage: 'Última mensagem...' },
  { id: 3, name: 'Química', lastMessage: 'Última mensagem...' },
  { id: 4, name: 'História', lastMessage: 'Última mensagem...' },
  { id: 5, name: 'Geografia', lastMessage: 'Última mensagem...' },
];

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detecta o tamanho da tela e define se é mobile ou desktop
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize(); // Executa na montagem
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      {/* SideChat: Exibe apenas no desktop ou no mobile quando nenhum contato está selecionado */}
      {(!isMobileView || !selectedContact) && (
        <div className="w-full md:w-1/3 bg-white border-r border-gray-300 p-4 overflow-y-auto rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversas</h2>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-200 rounded-lg transition ${
                selectedContact?.id === contact.id ? 'bg-gray-200' : ''
              }`}
            >
              <IconUserCircle size={40} className="text-gray-500" />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ChatArea: Exibe sempre no desktop e no mobile quando um contato está selecionado */}
      {(!isMobileView || selectedContact) && (
        <div className="flex flex-col flex-1 rounded-lg bg-white">
          <div className="h-16 bg-gray-200 flex items-center px-4 rounded-t-lg">
            {isMobileView && (
              <button
                onClick={() => setSelectedContact(null)} // Volta ao sidechat no mobile
                className="mr-4 text-orange-500 font-semibold"
              >
                Voltar
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedContact ? selectedContact.name : 'Selecione uma conversa'}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!selectedContact ? (
              <p className="text-gray-500 text-center mt-4">Selecione uma conversa para começar</p>
            ) : (
              <div className="space-y-3">
                <div className="text-left">
                  <p className="inline-block bg-gray-100 p-2 rounded-lg text-gray-700">Olá, tudo bem?</p>
                </div>
                <div className="text-right">
                  <p className="inline-block bg-blue-500 text-white p-2 rounded-lg">Tudo ótimo, e você?</p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="h-16 bg-white flex items-center p-4 border-t border-gray-300 rounded-b-lg">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
            <button className="ml-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
