import { Navigate, Outlet } from 'umi';

export default () => {
  const isLogin = sessionStorage.getItem('token') !== null;
  if (!isLogin) {
    // 跳转到登录页，并携带当前路径作为参数
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
        replace
      />
    );
  }
  return <Outlet />;
};
