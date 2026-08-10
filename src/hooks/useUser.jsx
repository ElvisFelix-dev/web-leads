import { useContext } from 'react';

import { UserContext } from '../context/UserContext';

export default function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro do UserProvider');
  }

  return context;
}
