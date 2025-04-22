import { getToken } from '@/utils/auth';
import { FC, useEffect } from 'react';
import { history, useLocation } from 'umi';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login'];

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

    if (!token && !isPublicPath) {
      history.replace('/login');
    } else if (token && isPublicPath) {
      history.replace('/');
    }
  }, [location.pathname]);

  return <>{children}</>;
};

export default AuthGuard;
