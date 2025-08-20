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
      redirect: '/dashboard',
    },
    {
      name: '仪表盘',
      path: '/dashboard',
      component: './Home',
    },
    {
      name: '商品管理',
      path: '/product',
      routes: [
        {
          name: '商品列表',
          path: '/product/list',
          // component: './Product/List',
        },
        {
          name: '商品分类',
          path: '/product/category',
          // component: './Product/Category',
        },
      ],
    },
    {
      name: '订单管理',
      path: '/order',
      routes: [
        {
          path: '/order/business',
          name: '历史成交订单', // 修改这里
          component: './Business',
        },
      ],
      // component: './Order',
    },
    {
      name: '会员管理',
      path: '/member',
      // component: './Member',
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
