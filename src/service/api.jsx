import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem('userInfo');

      if (userInfo) {
        const user = JSON.parse(userInfo);
        const token = user?.token;

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Erro ao recuperar autenticação:', error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;

// Configure VITE_API_URL in the deployment environment when changing API origin.
// Example local value: http://localhost:3333 || https://leadsnamao.onrender.com
