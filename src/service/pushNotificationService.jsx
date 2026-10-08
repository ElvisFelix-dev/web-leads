import api from './api';

/**
 * Busca a chave pública VAPID no backend.
 */
export const getVapidPublicKey = async () => {
  const response = await api.get('/api/users/push/vapid-public-key');

  return response.data?.data?.publicKey;
};

/**
 * Registra o Service Worker responsável pelas notificações.
 */
export const registerPushServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador não suporta Service Worker.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');

  await navigator.serviceWorker.ready;

  return registration;
};

/**
 * Converte a chave VAPID recebida do backend
 * para Uint8Array, formato exigido pelo Push API.
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

/**
 * Solicita permissão e cria a subscription real
 * do navegador.
 */
export const createPushSubscription = async () => {
  if (!('Notification' in window)) {
    throw new Error('Este navegador não suporta notificações.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Este navegador não suporta Web Push.');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Permissão para notificações não concedida.');
  }

  const registration = await registerPushServiceWorker();

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  const publicKey = await getVapidPublicKey();

  if (!publicKey) {
    throw new Error('Chave pública VAPID não encontrada.');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  return subscription;
};

/**
 * Converte a PushSubscription para JSON
 * antes de enviar ao backend.
 */
export const subscribePush = async () => {
  const subscription = await createPushSubscription();

  const subscriptionJson = subscription.toJSON();

  const response = await api.post('/api/users/push/subscribe', {
    subscription: subscriptionJson,
  });

  return {
    ...response.data,
    subscription,
  };
};

/**
 * Remove a subscription deste dispositivo.
 */
export const unsubscribePush = async () => {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');

  if (!registration) {
    return {
      success: true,
      subscribed: false,
    };
  }

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return {
      success: true,
      subscribed: false,
    };
  }

  await api.delete('/api/users/push/unsubscribe', {
    data: {
      endpoint: subscription.endpoint,
    },
  });

  await subscription.unsubscribe();

  return {
    success: true,
    subscribed: false,
  };
};

/**
 * Verifica se este navegador já possui
 * uma subscription ativa.
 */
export const isPushSubscribed = async () => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  if (!('PushManager' in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');

  if (!registration) {
    return false;
  }

  const subscription = await registration.pushManager.getSubscription();

  return Boolean(subscription);
};

/**
 * Envia uma notificação de teste através do backend.
 */
export const sendTestPush = async ({ title, body, url } = {}) => {
  const response = await api.post('/api/users/push/test', {
    title,
    body,
    url,
  });

  return response.data;
};
