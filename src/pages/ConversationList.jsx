// src/components/dashboard/ConversationList.jsx
import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
} from 'lucide-react';
import api from '../service/api';

export default function ConversationList({ brokerId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Carregar conversas
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/conversations');
      setConversations(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(
        `/api/conversations/${conversationId}/messages`,
      );
      setMessages(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      await api.post(`/api/conversations/${selectedConv._id}/send`, {
        message: newMessage.trim(),
      });

      // Recarregar mensagens
      await loadMessages(selectedConv._id);
      setNewMessage('');

      // Atualizar lista de conversas
      await loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Conversas</h3>
          <p className="text-sm text-gray-500">Central de mensagens</p>
        </div>
        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => handleSelectConversation(conv)}
            className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${
              selectedConv?._id === conv._id ? 'bg-gray-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">
                    {conv.lead?.name || 'Lead'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 truncate">
                    {conv.lastMessage || 'Nenhuma mensagem'}
                  </span>
                  {getStatusIcon(conv.status)}
                </div>
                {conv.lead?.stage && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {conv.lead.stage}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">
                  {selectedConv.lead?.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{selectedConv.metadata?.leadPhone}</span>
                </div>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedConv.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : selectedConv.status === 'waiting'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {selectedConv.status}
                </span>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.from === 'broker' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.from === 'broker'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-800"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Selecione uma conversa</p>
              <p className="text-sm">para visualizar as mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
