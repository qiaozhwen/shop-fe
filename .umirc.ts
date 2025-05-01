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
      wrappers: ['@/wrappers/auth'],
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
      wrappers: ['@/wrappers/auth'],
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
      wrappers: ['@/wrappers/auth'],
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
