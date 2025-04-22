import { Navigate } from 'umi';

export default (props: any) => {
  // 检查是否登录，示例从 localStorage 判断
  const isLogin = localStorage.getItem('token') !== null;

  if (!isLogin) {
    // 跳转到登录页，并携带当前路径作为参数
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
        replace
      />
    );
  }
  return props.children;
};
