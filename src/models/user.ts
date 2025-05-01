import { useState } from 'react';

export default () => {
  const [username, setUsername] = useState<string>(
    sessionStorage.getItem('username') || '',
  );

  return {
    username,
    setUsername: (newUsername: string) => {
      setUsername(newUsername);
      sessionStorage.setItem('username', newUsername);
    },
    clearUser: () => {
      setUsername('');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('token');
    },
  };
};
