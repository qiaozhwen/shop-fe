import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Boxes,
  Truck,
  Tag,
  Users,
  Store,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { key: string; label: string; path: string; badgeKey?: string };
export type NavGroup = { label: string; items: NavItem[] };
export type NavModule = {
  key: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  path: string;
  groups: NavGroup[];
};

export const modules: NavModule[] = [
  {
    key: 'dashboard',
    label: '工作台',
    sub: '门店全景',
    icon: LayoutDashboard,
    path: '/dashboard',
    groups: [{ label: '概览', items: [{ key: 'home', label: '今日工作台', path: '/dashboard' }] }],
  },
  {
    key: 'pos',
    label: '收银 POS',
    sub: '现场开单',
    icon: ShoppingCart,
    path: '/pos',
    groups: [{ label: '开单', items: [{ key: 'pos', label: '快速开单', path: '/pos' }] }],
  },
  {
    key: 'sales',
    label: '销售订单',
    sub: '订单与加工',
    icon: Receipt,
    path: '/sales',
    groups: [
      {
        label: '订单',
        items: [
          { key: 'list', label: '订单列表', path: '/sales/orders', badgeKey: 'pendingOrders' },
        ],
      },
      {
        label: '加工',
        items: [
          {
            key: 'board',
            label: '加工看板',
            path: '/sales/processing',
            badgeKey: 'processing',
          },
        ],
      },
    ],
  },
  {
    key: 'inventory',
    label: '库存',
    sub: '活禽与损耗',
    icon: Boxes,
    // Router has /poultry/categories, /inventory, /loss — no common /inventory parent for all
    path: '/inventory',
    groups: [
      {
        label: '基础',
        items: [
          // Path corrected: router uses /poultry/categories (not /inventory/category)
          { key: 'category', label: '活禽品类', path: '/poultry/categories' },
        ],
      },
      {
        label: '存栏',
        items: [
          // Path corrected: router uses /inventory (not /inventory/stock)
          { key: 'stock', label: '库存', path: '/inventory' },
          // Path corrected: router uses /loss (not /inventory/loss)
          { key: 'loss', label: '损耗', path: '/loss' },
        ],
      },
    ],
  },
  {
    key: 'procurement',
    label: '采购',
    sub: '入库与供应商',
    icon: Truck,
    path: '/procurement',
    groups: [
      {
        label: '采购',
        items: [
          // Path corrected: router uses /procurement (not /procurement/orders)
          { key: 'order', label: '采购单', path: '/procurement' },
          // Path corrected: router uses /supplier (not /procurement/suppliers)
          { key: 'supplier', label: '供应商', path: '/supplier' },
        ],
      },
    ],
  },
  {
    key: 'pricing',
    label: '价格',
    sub: '门店定价',
    icon: Tag,
    path: '/pricing',
    groups: [{ label: '价格', items: [{ key: 'all', label: '价格管理', path: '/pricing' }] }],
  },
  {
    key: 'member',
    label: '会员',
    sub: '客户与积分',
    icon: Users,
    // Path corrected: router uses /member (not /members)
    path: '/member',
    groups: [
      { label: '会员', items: [{ key: 'list', label: '会员列表', path: '/member' }] },
    ],
  },
  {
    key: 'shop',
    label: '门店',
    sub: '组织与员工',
    icon: Store,
    // Path corrected: router has /stores and /staff (no /shop parent)
    path: '/stores',
    groups: [
      {
        label: '组织',
        items: [
          // Path corrected: router uses /stores (not /shop/stores)
          { key: 'stores', label: '门店', path: '/stores' },
          // Path corrected: router uses /staff (not /shop/staff)
          { key: 'staff', label: '员工', path: '/staff' },
        ],
      },
    ],
  },
  {
    key: 'report',
    label: '报表',
    sub: '经营分析',
    icon: BarChart3,
    // Path corrected: router uses /report (not /reports)
    path: '/report',
    groups: [{ label: '报表', items: [{ key: 'all', label: '经营报表', path: '/report' }] }],
  },
];

// TODO: route not yet defined for /settings
export const settingsItem = { key: 'settings', label: '设置', icon: Settings, path: '/settings' };
