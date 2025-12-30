import { defineConfig } from '@umijs/max';

export default defineConfig({
  mfsu: false,
  antd: {},
  favicon: '/favicon.svg',
  links: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/favicon.svg' },
  ],
  styles: ['@/global.less'],
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '禽翼鲜生',
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
      name: '工作台',
      path: '/dashboard',
      icon: 'dashboard',
      component: './Dashboard',
    },
    {
      name: '商品管理',
      path: '/product',
      icon: 'appstore',
      routes: [
        {
          name: '活禽列表',
          path: '/product/list',
          icon: 'unorderedList',
          component: './Product/List',
        },
        {
          name: '商品分类',
          path: '/product/category',
          icon: 'tags',
          component: './Product/Category',
        },
      ],
    },
    {
      name: '库存管理',
      path: '/inventory',
      icon: 'database',
      routes: [
        {
          name: '库存概览',
          path: '/inventory/overview',
          icon: 'pieChart',
          component: './Inventory/Overview',
        },
        {
          name: '入库管理',
          path: '/inventory/inbound',
          icon: 'import',
          component: './Inventory/Inbound',
        },
        {
          name: '出库管理',
          path: '/inventory/outbound',
          icon: 'export',
          component: './Inventory/Outbound',
        },
        {
          name: '库存预警',
          path: '/inventory/alert',
          icon: 'bell',
          component: './Inventory/Alert',
        },
      ],
    },
    {
      name: '订单管理',
      path: '/order',
      icon: 'shoppingCart',
      routes: [
        {
          name: '销售开单',
          path: '/order/create',
          icon: 'fileAdd',
          component: './Order/Create',
        },
        {
          name: '订单列表',
          path: '/order/list',
          icon: 'orderedList',
          component: './Order/List',
        },
        {
          name: '订单统计',
          path: '/order/statistics',
          icon: 'barChart',
          component: './Order/Statistics',
        },
      ],
    },
    {
      name: '客户管理',
      path: '/customer',
      icon: 'team',
      routes: [
        {
          name: '客户列表',
          path: '/customer/list',
          icon: 'contacts',
          component: './Customer/List',
        },
        {
          name: '客户分析',
          path: '/customer/analysis',
          icon: 'fundProjectionScreen',
          component: './Customer/Analysis',
        },
      ],
    },
    {
      name: '供应商管理',
      path: '/supplier',
      icon: 'shop',
      routes: [
        {
          name: '供应商列表',
          path: '/supplier/list',
          icon: 'solution',
          component: './Supplier/List',
        },
        {
          name: '采购管理',
          path: '/supplier/purchase',
          icon: 'shoppingCart',
          component: './Supplier/Purchase',
        },
      ],
    },
    {
      name: '财务管理',
      path: '/finance',
      icon: 'moneyCollect',
      routes: [
        {
          name: '收支统计',
          path: '/finance/summary',
          icon: 'fundView',
          component: './Finance/Summary',
        },
        {
          name: '账单明细',
          path: '/finance/bills',
          icon: 'fileText',
          component: './Finance/Bills',
        },
      ],
    },
    {
      name: '数据报表',
      path: '/report',
      icon: 'areaChart',
      routes: [
        {
          name: '销售报表',
          path: '/report/sales',
          icon: 'lineChart',
          component: './Report/Sales',
        },
        {
          name: '库存报表',
          path: '/report/inventory',
          icon: 'stock',
          component: './Report/Inventory',
        },
      ],
    },
    {
      name: '系统设置',
      path: '/system',
      icon: 'setting',
      routes: [
        {
          name: '员工管理',
          path: '/system/staff',
          icon: 'user',
          component: './System/Staff',
        },
        {
          name: '系统日志',
          path: '/system/logs',
          icon: 'fileSearch',
          component: './System/Logs',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
