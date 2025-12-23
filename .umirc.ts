import { defineConfig } from '@umijs/max';

export default defineConfig({
  mfsu: false,
  antd: {},
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
          component: './Product/List',
        },
        {
          name: '商品分类',
          path: '/product/category',
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
          component: './Inventory/Overview',
        },
        {
          name: '入库管理',
          path: '/inventory/inbound',
          component: './Inventory/Inbound',
        },
        {
          name: '出库管理',
          path: '/inventory/outbound',
          component: './Inventory/Outbound',
        },
        {
          name: '库存预警',
          path: '/inventory/alert',
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
          component: './Order/Create',
        },
        {
          name: '订单列表',
          path: '/order/list',
          component: './Order/List',
        },
        {
          name: '订单统计',
          path: '/order/statistics',
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
          component: './Customer/List',
        },
        {
          name: '客户分析',
          path: '/customer/analysis',
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
          component: './Supplier/List',
        },
        {
          name: '采购管理',
          path: '/supplier/purchase',
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
          component: './Finance/Summary',
        },
        {
          name: '账单明细',
          path: '/finance/bills',
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
          component: './Report/Sales',
        },
        {
          name: '库存报表',
          path: '/report/inventory',
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
          component: './System/Staff',
    },
    {
          name: '系统日志',
          path: '/system/logs',
          component: './System/Logs',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target:
        process.env.NODE_ENV === 'development'
          ? 'http://106.14.227.122:5000'
          : 'http://106.14.227.122:5000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
