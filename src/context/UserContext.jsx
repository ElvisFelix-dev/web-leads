import { createContext, useEffect, useState } from 'react';

import api from '../service/api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  /*
  =========================================
  ESTADO
  =========================================
  */

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userInfo');

    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('userInfo');
      return null;
    }
  });

  /*
  =========================================
  CARREGAR USUÁRIO MAIS RECENTE DO BACKEND
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('userInfo');

        if (!stored) return;

        const storedUser = JSON.parse(stored);

        if (!storedUser?.token) return;

        const { data } = await api.get('/api/users/me');

        const updatedUser = {
          ...storedUser,
          ...data,
          token: storedUser.token,
        };

        setUser(updatedUser);

        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Erro carregando usuário:', error);

        setUser(null);

        localStorage.removeItem('userInfo');
      }
    };

    loadUser();
  }, []);

  /*
  =========================================
  LOGIN
  =========================================
  */

  const login = (userData) => {
    setUser(userData);

    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  /*
  =========================================
  ATUALIZAR USUÁRIO
  =========================================
  */

  const updateUser = (updatedData) => {
    setUser((previous) => {
      const newUser = {
        ...previous,
        ...updatedData,
      };

      localStorage.setItem('userInfo', JSON.stringify(newUser));

      return newUser;
    });
  };

  /*
  =========================================
  LOGOUT
  =========================================
  */

  const logout = () => {
    setUser(null);

    localStorage.removeItem('userInfo');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: updateUser,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
