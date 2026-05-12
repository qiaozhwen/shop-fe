import { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Select, theme, Badge } from 'antd';
import {
  DashboardOutlined, ShopOutlined, ShoppingCartOutlined, FileTextOutlined,
  ToolOutlined, AppstoreOutlined, DatabaseOutlined, TruckOutlined,
  TeamOutlined, UserOutlined, DollarOutlined, BarChartOutlined,
  WarningOutlined, IdcardOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LogoutOutlined, BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useAllStores } from '@/hooks/useStores';
import { useProcessingTasks } from '@/hooks/useProcessing';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/pos', icon: <ShoppingCartOutlined />, label: 'POS 开单' },
  {
    key: 'sales-group', icon: <FileTextOutlined />, label: '销售管理',
    children: [
      { key: '/sales/orders', label: '销售订单' },
      { key: '/sales/processing', label: '加工工单' },
    ],
  },
  {
    key: 'stock-group', icon: <DatabaseOutlined />, label: '活禽库存',
    children: [
      { key: '/poultry/categories', label: '活禽品类' },
      { key: '/inventory', label: '存栏管理' },
      { key: '/loss', label: '损耗记录' },
    ],
  },
  {
    key: 'purchase-group', icon: <TruckOutlined />, label: '采购供应',
    children: [
      { key: '/procurement', label: '采购入库' },
      { key: '/supplier', label: '供应商' },
    ],
  },
  { key: '/pricing', icon: <DollarOutlined />, label: '价格管理' },
  { key: '/member', icon: <IdcardOutlined />, label: '会员管理' },
  {
    key: 'org-group', icon: <TeamOutlined />, label: '门店组织',
    children: [
      { key: '/stores', label: '门店管理' },
      { key: '/staff', label: '员工管理' },
    ],
  },
  { key: '/report', icon: <BarChartOutlined />, label: '报表中心' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clear } = useAuthStore();
  const { collapsed, toggleCollapsed, currentStoreId, setCurrentStore } = useAppStore();
  const { data: stores } = useAllStores();
  const { data: processing } = useProcessingTasks({ pageSize: 50 });
  const { token } = theme.useToken();

  const pendingCount = useMemo(
    () => processing?.list.filter((t) => t.status !== 'DELIVERED' && t.status !== 'CANCELED').length ?? 0,
    [processing]
  );

  const selected = useMemo(() => {
    const path = location.pathname;
    const all = menuItems.flatMap((m: any) => (m.children ? m.children.map((c: any) => c.key) : [m.key]));
    return all.filter((k) => path === k || path.startsWith(k + '/'));
  }, [location.pathname]);

  const openKeys = useMemo(() => {
    return menuItems
      .filter((m: any) => m.children?.some((c: any) => location.pathname.startsWith(c.key)))
      .map((m) => m.key);
  }, [location.pathname]);
  const [openControlled, setOpenControlled] = useState<string[]>(openKeys);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: collapsed ? 14 : 16, color: token.colorPrimary,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          {collapsed ? '🐔' : '🐔 活禽现杀门店'}
        </div>
        <Menu
          mode="inline"
          theme="light"
          items={menuItems as any}
          selectedKeys={selected}
          openKeys={collapsed ? [] : openControlled}
          onOpenChange={(k) => setOpenControlled(k as string[])}
          onClick={(info) => {
            if (info.key.startsWith('/')) navigate(info.key);
          }}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <span onClick={toggleCollapsed} style={{ cursor: 'pointer', fontSize: 18 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <span style={{ color: token.colorTextSecondary }}>当前门店：</span>
          <Select
            size="middle"
            style={{ minWidth: 200 }}
            value={currentStoreId ?? undefined}
            onChange={(v) => setCurrentStore(v)}
            options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))}
            placeholder="请选择门店"
            suffixIcon={<ShopOutlined />}
          />
          <div style={{ flex: 1 }} />
          <Badge count={pendingCount} size="small" offset={[-2, 2]}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={() => navigate('/sales/processing')}
            />
          </Badge>
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { clear(); navigate('/login'); } },
              ],
            }}
          >
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.nickname ?? '未登录'}</span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, minHeight: 'calc(100vh - 88px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

// 引用以确保 ts 不报未用
void [ToolOutlined, AppstoreOutlined, WarningOutlined];
