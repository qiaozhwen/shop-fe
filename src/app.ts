// 运行时配置
import { removeToken } from '@/utils/auth';
import { message } from 'antd';
import { history } from 'umi';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string; avatar?: string }> {
  const username = sessionStorage.getItem('username');
  let name = '禽翼鲜生';
  if (username) {
    try {
      const user = JSON.parse(username);
      name = user.name || user.username || name;
    } catch (e) {
      name = username;
    }
  }
  return { name, avatar: undefined };
}

export const layout = () => {
  // 检测是否为移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return {
    logo: '/logo.svg',
    title: '禽翼鲜生',
    menu: {
      locale: false,
    },
    // 移动端使用 side 布局，桌面端使用 mix 布局
    layout: isMobile ? 'side' : 'mix',
    splitMenus: false,
    fixedHeader: true,
    fixSiderbar: !isMobile,
    colorPrimary: '#D4380D',
    siderWidth: isMobile ? 200 : 220,
    // 移动端默认收起侧边栏
    collapsed: isMobile,
    // 移动端优化
    breakpoint: 'lg',
    collapsedButtonRender: false,
    token: {
      header: {
        colorBgHeader: '#fff',
        colorHeaderTitle: '#262626',
        colorTextMenu: '#595959',
        colorTextMenuSecondary: '#8c8c8c',
        colorTextMenuSelected: '#D4380D',
        colorBgMenuItemSelected: '#fff1f0',
        colorTextMenuActive: '#D4380D',
        colorTextRightActionsItem: '#595959',
        // 移动端 header 高度
        heightLayoutHeader: isMobile ? 48 : 56,
      },
      sider: {
        colorMenuBackground: '#fff',
        colorMenuItemDivider: '#f0f0f0',
        colorTextMenu: '#595959',
        colorTextMenuSelected: '#D4380D',
        colorBgMenuItemSelected: '#fff1f0',
        colorTextMenuActive: '#D4380D',
      },
      pageContainer: {
        // 移动端减小内边距
        paddingBlockPageContainerContent: isMobile ? 12 : 24,
        paddingInlinePageContainerContent: isMobile ? 12 : 24,
      },
    },
    avatarProps: {
      src: undefined,
      title: '用户',
      size: isMobile ? 'small' : 'default',
      render: (props: any, dom: any) => {
        return dom;
      },
    },
    actionsRender: () => [],
    footerRender: false,
    menuHeaderRender: undefined,
    onPageChange: () => {
      const { pathname } = history.location;
      // 如果没有登录，重定向到 login
      const token = sessionStorage.getItem('token');
      if (!token && pathname !== '/login') {
        history.push('/login');
      }
    },
  };
};

// 请求响应拦截器
// 在响应拦截器中添加错误处理
export const request = {
  timeout: 10000,

  requestInterceptors: [
    (url: string, options: any) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { url, options };
    },
  ],
  responseInterceptors: [
    [
      (response: any) => {
        // Intercept successful responses to check for business error codes.
        const { data } = response as any;
        if (data?.code === 401) {
          removeToken();
          history.push('/login');
        }
        return response;
      },
      (error: any) => {
        // Intercept failed responses to handle HTTP errors.
        if (error.response?.status === 401) {
          removeToken();
          history.push('/login');
        }
        message.error(error.response?.data?.message || '请求失败');
        return Promise.reject(error);
      },
    ],
  ],
};
