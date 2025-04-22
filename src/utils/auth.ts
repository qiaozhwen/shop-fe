/** 获取token */
export const getToken = () => {
  return sessionStorage.getItem('token');
};

/** 设置token */
export const setToken = (token: string) => {
  sessionStorage.setItem('token', token);
};

/** 移除token */
export const removeToken = () => {
  sessionStorage.removeItem('token');
};

/** 检查是否已登录 */
export const isAuthenticated = () => {
  return !!getToken();
};
