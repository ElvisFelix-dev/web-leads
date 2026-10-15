self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[Service Worker] Erro ao interpretar push:', error);
  }

  const title = data.title || 'Leads Na Mão';

  const options = {
    body: data.body || 'Você recebeu uma nova notificação.',

    icon: data.icon || '/logo192.png',

    badge: data.badge || '/logo192.png',

    tag: data.tag || 'leads-na-mao',

    data: data.data || {
      url: data.url || '/dashboard',
    },

    requireInteraction: Boolean(data.requireInteraction),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};

  const url = notificationData.url || notificationData.link || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

        return undefined;
      }),
  );
});
