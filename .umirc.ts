import { defineConfig } from '@umijs/max';

export default defineConfig({
  mfsu: false,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  esbuildMinifyIIFE: true,
  routes: [
    {
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: '首页',
      component: './Home',
    },
    {
      path: '/table',
      name: '表格',
      component: './Table',
    },
    {
      path: '/business',
      name: '业务页面',
      component: './Business',
    },  
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'http://106.14.227.122:5000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
