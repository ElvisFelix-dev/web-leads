import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../service/api';
import { UserContext } from './UserContext';
import { useChat } from './ChatContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications deve ser usado dentro de NotificationProvider.',
    );
  }

  return context;
};

export function NotificationProvider({ children }) {
  const { user } = useContext(UserContext);
  const { socket } = useChat();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const seenIds = useRef(new Set());

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const response = await api.get('/api/notifications/unread-count');
      const count = Number(response?.data?.data?.unreadCount || 0);
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error(
        '[Notifications] Não foi possível carregar o contador:',
        error,
      );
      return null;
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      setUnreadCount(0);
      setLatestNotification(null);
      seenIds.current.clear();
      return;
    }

    refreshUnreadCount();
  }, [user?._id, refreshUnreadCount]);

  useEffect(() => {
    if (!socket || !user?._id) return undefined;

    // ✅ Entrar na sala correta de notificações (admins ou broker_{id})
    socket.emit('join_notifications', {
      role: user.role,
      userId: user._id,
    });

    const handleNewNotification = (notification) => {
      if (!notification || typeof notification !== 'object') return;

      const id = notification._id ? String(notification._id) : null;
      if (id && seenIds.current.has(id)) return;
      if (id) {
        seenIds.current.add(id);
        if (seenIds.current.size > 200) {
          const first = seenIds.current.values().next().value;
          seenIds.current.delete(first);
        }
      }

      setLatestNotification({
        ...notification,
        _receivedAt: Date.now(),
      });
      setUnreadCount((previous) => previous + 1);

      const title = notification.title || 'Nova notificação';
      const message =
        notification.message || 'Você recebeu uma atualização no CRM.';
      toast.info(
        <button
          type="button"
          className="w-full text-left"
          onClick={() => {
            const target = notification.link || '/notifications';
            navigate(target);
          }}
        >
          <span className="block font-semibold">{title}</span>
          <span className="mt-1 block text-sm">{message}</span>
          <span className="mt-2 block text-xs opacity-70">
            Clique para abrir
          </span>
        </button>,
        { autoClose: 6500, toastId: id || undefined },
      );
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, user?._id, user?.role, navigate]);

  const value = {
    unreadCount,
    latestNotification,
    refreshUnreadCount,
    setUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
