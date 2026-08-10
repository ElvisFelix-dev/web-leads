import axios from 'axios';

const api = axios.create({
  baseURL: 'https://leadsnamao.onrender.com',
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');

  if (userInfo) {
    const user = JSON.parse(userInfo);

    const token = user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;

//  'https://leadsnamao.onrender.com',
// 'http://localhost:3333',
