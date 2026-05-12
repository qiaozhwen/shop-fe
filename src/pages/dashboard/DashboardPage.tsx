import { Card, Col, Row, Tag, Progress, Spin, Empty, Button, Avatar, List, Divider, Space } from 'antd';
import {
  ShoppingCartOutlined, DollarOutlined, DatabaseOutlined, WarningOutlined,
  ToolOutlined, IdcardOutlined, ShopOutlined, TeamOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined,
  PlusOutlined, FileTextOutlined, BarChartOutlined, RiseOutlined,
  FireOutlined, BellOutlined, CrownOutlined, GiftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useDashboard } from '@/hooks/usePeople';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useStores } from '@/hooks/useStores';

const GRADIENTS = {
  red: 'linear-gradient(135deg, #ff7875 0%, #d4380d 100%)',
  blue: 'linear-gradient(135deg, #69b1ff 0%, #1677ff 100%)',
  green: 'linear-gradient(135deg, #95de64 0%, #389e0d 100%)',
  orange: 'linear-gradient(135deg, #ffd591 0%, #fa8c16 100%)',
  purple: 'linear-gradient(135deg, #b37feb 0%, #722ed1 100%)',
  cyan: 'linear-gradient(135deg, #5cdbd3 0%, #08979c 100%)',
  pink: 'linear-gradient(135deg, #ff85c0 0%, #c41d7f 100%)',
  indigo: 'linear-gradient(135deg, #85a5ff 0%, #2f54eb 100%)',
};

function StatCard(props: {
  title: string; value: number | string; prefix?: string; suffix?: string;
  icon: React.ReactNode; gradient: string; trend?: number; sub?: string;
}) {
  const { title, value, prefix, suffix, icon, gradient, trend, sub } = props;
  return (
    <Card
      styles={{ body: { padding: 0 } }}
      style={{ borderRadius: 12, overflow: 'hidden', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div style={{ background: gradient, padding: '20px 22px', color: '#fff', position: 'relative', minHeight: 130 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
              <span style={{ fontSize: 14, marginLeft: 4, opacity: 0.85 }}>{suffix}</span>
            </div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{icon}</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, opacity: 0.92, display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend !== undefined && (
            <span style={{
              background: 'rgba(255,255,255,0.22)', borderRadius: 4, padding: '2px 6px',
              display: 'inline-flex', alignItems: 'center', gap: 2,
            }}>
              {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(trend)}%
            </span>
          )}
          <span>{sub}</span>
        </div>
      </div>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;
  const w = 100, h = 36;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((v, i) => `${(i * step).toFixed(2)},${(h - ((v - min) / range) * h).toFixed(2)}`).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TrendBarChart({ data }: { data: { date: string; sales: number; orders: number }[] }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.map((d) => d.sales), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, padding: '12px 4px 0' }}>
      {data.map((d) => {
        const h = (d.sales / max) * 160;
        return (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>¥{d.sales}</div>
            <div
              style={{
                width: '100%', maxWidth: 38, height: h,
                background: 'linear-gradient(180deg, #ff7875 0%, #d4380d 100%)',
                borderRadius: '6px 6px 0 0',
                boxShadow: '0 2px 6px rgba(212,56,13,0.25)',
                transition: 'all .3s',
              }}
              title={`订单 ${d.orders}`}
            />
            <div style={{ fontSize: 11, color: '#595959' }}>{d.date.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentStoreId = useAppStore((s) => s.currentStoreId);
  const { data: storesData } = useStores({ pageSize: 999 });
  const currentStore = storesData?.list.find((s) => s.id === currentStoreId);

  if (isLoading || !data) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  const hour = dayjs().hour();
  const greet = hour < 6 ? '凌晨好' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  const trendValues = data.salesTrend.map((s) => s.sales);
  const orderValues = data.salesTrend.map((s) => s.orders);
  const maxStock = Math.max(...data.stockByStore.map((s) => s.quantity), 1);
  const maxCat = Math.max(...data.categoryRanking.map((s) => s.sales), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部 Hero */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: 14, overflow: 'hidden', border: 'none' }}
      >
        <div style={{
          background: 'linear-gradient(120deg, #d4380d 0%, #fa541c 50%, #fa8c16 100%)',
          padding: '28px 32px', color: '#fff', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: -40, top: -40, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', right: 80, bottom: -60, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          }} />
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Space size={16} align="center">
                <Avatar size={64} style={{ background: 'rgba(255,255,255,0.25)', fontSize: 28 }}>
                  {user?.nickname?.[0] || '掌'}
                </Avatar>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
                    {greet}，{user?.nickname || '掌柜'} 👋
                  </div>
                  <div style={{ opacity: 0.92, fontSize: 14 }}>
                    {dayjs().format('YYYY年MM月DD日 dddd')} · 当前门店：
                    <strong>{currentStore?.name || '未选择'}</strong>
                    {currentStore && <Tag color="white" style={{ color: '#d4380d', marginLeft: 8 }}>{currentStore.address}</Tag>}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.88 }}>
                    今日已售 <strong>{data.todayOrders}</strong> 单 · 进账 <strong>¥{data.todaySales.toFixed(2)}</strong> · 待加工 <strong>{data.processingPending}</strong> 单
                  </div>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={10} style={{ textAlign: 'right' }}>
              <Space wrap>
                <Button size="large" icon={<ShoppingCartOutlined />} style={{ background: '#fff', color: '#d4380d', border: 'none', fontWeight: 500 }} onClick={() => navigate('/pos')}>
                  立即开单
                </Button>
                <Button size="large" icon={<ToolOutlined />} ghost onClick={() => navigate('/processing')}>
                  加工看板
                </Button>
                <Button size="large" icon={<BarChartOutlined />} ghost onClick={() => navigate('/reports')}>
                  报表
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* 数据卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日销售额" value={data.todaySales.toFixed(2)} prefix="¥" icon={<DollarOutlined />} gradient={GRADIENTS.red} trend={12.5} sub="较昨日" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日订单数" value={data.todayOrders} suffix="单" icon={<ShoppingCartOutlined />} gradient={GRADIENTS.blue} trend={8.3} sub="较昨日" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="活禽存栏" value={data.poultryStock} suffix="只" icon={<DatabaseOutlined />} gradient={GRADIENTS.green} sub="全门店合计" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="加工待处理" value={data.processingPending} suffix="单" icon={<ToolOutlined />} gradient={GRADIENTS.purple} sub="点击查看看板" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日损耗" value={data.todayLoss} suffix="只" icon={<WarningOutlined />} gradient={GRADIENTS.orange} trend={-2.1} sub="较昨日" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="会员总数" value={data.memberCount} suffix="位" icon={<IdcardOutlined />} gradient={GRADIENTS.cyan} sub="累计注册" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="门店数" value={data.storeCount} suffix="家" icon={<ShopOutlined />} gradient={GRADIENTS.pink} sub="营业中" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="员工总数" value={data.staffCount} suffix="人" icon={<TeamOutlined />} gradient={GRADIENTS.indigo} sub="在岗" />
        </Col>
      </Row>

      {/* 趋势 + 品类 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={<Space><RiseOutlined style={{ color: '#d4380d' }} />近 7 日销售趋势</Space>}
            extra={<Tag color="red">销售额</Tag>}
            style={{ borderRadius: 12 }}
          >
            <TrendBarChart data={data.salesTrend} />
            <Divider style={{ margin: '16px 0 12px' }} />
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>销售额走势</div>
                <Sparkline data={trendValues} color="#d4380d" />
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>订单量走势</div>
                <Sparkline data={orderValues} color="#1677ff" />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Space><FireOutlined style={{ color: '#fa541c' }} />热销品类 TOP</Space>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            {data.categoryRanking.length === 0 ? <Empty /> : data.categoryRanking.map((c, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const colors = ['#d4380d', '#fa8c16', '#faad14', '#1677ff', '#52c41a'];
              return (
                <div key={c.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>
                      <span style={{ marginRight: 8, fontSize: 16 }}>{medals[i] || `#${i + 1}`}</span>
                      {c.name}
                    </span>
                    <span style={{ fontWeight: 600, color: colors[i] || '#595959' }}>¥{c.sales.toLocaleString()}</span>
                  </div>
                  <Progress
                    percent={Math.round((c.sales / maxCat) * 100)}
                    showInfo={false}
                    strokeColor={{ from: colors[i] || '#1677ff', to: colors[i] || '#1677ff' }}
                    trailColor="#f5f5f5"
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      {/* 门店存栏 + 待办 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<Space><ShopOutlined style={{ color: '#52c41a' }} />各门店活禽存栏</Space>}
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[20, 20]}>
              {data.stockByStore.map((s) => {
                const pct = Math.round((s.quantity / maxStock) * 100);
                return (
                  <Col xs={24} sm={12} key={s.store}>
                    <div style={{
                      padding: 16, borderRadius: 10,
                      background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
                      border: '1px solid #b7eb8f',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Space>
                          <Avatar size={36} style={{ background: '#52c41a' }} icon={<ShopOutlined />} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.store}</div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>当前存栏</div>
                          </div>
                        </Space>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 22, fontWeight: 600, color: '#389e0d', lineHeight: 1 }}>{s.quantity}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>只</div>
                        </div>
                      </div>
                      <Progress percent={pct} showInfo={false} strokeColor="#52c41a" trailColor="#f0f0f0" />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Space><BellOutlined style={{ color: '#fa8c16' }} />今日待办</Space>}
            extra={<Button type="link" size="small">全部</Button>}
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={[
                { icon: <ToolOutlined />, color: '#722ed1', title: `${data.processingPending} 个加工任务待处理`, desc: '客户已下单，请尽快宰杀加工', action: () => navigate('/processing') },
                { icon: <WarningOutlined />, color: '#faad14', title: '部分品类库存偏低', desc: '建议安排采购入栏', action: () => navigate('/inventory') },
                { icon: <CrownOutlined />, color: '#d4380d', title: '今日新增 3 名会员', desc: '可发送欢迎短信', action: () => navigate('/members') },
                { icon: <GiftOutlined />, color: '#52c41a', title: '本周促销价已生效', desc: '查看价格管理', action: () => navigate('/pricing') },
                { icon: <FileTextOutlined />, color: '#1677ff', title: '日报表生成完成', desc: '可导出查看', action: () => navigate('/reports') },
              ]}
              renderItem={(item) => (
                <List.Item style={{ cursor: 'pointer' }} onClick={item.action}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: item.color }} icon={item.icon} />}
                    title={<span style={{ fontSize: 14 }}>{item.title}</span>}
                    description={<span style={{ fontSize: 12 }}>{item.desc}</span>}
                  />
                  <ThunderboltOutlined style={{ color: '#bfbfbf' }} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card style={{ borderRadius: 12 }} title={<Space><PlusOutlined style={{ color: '#d4380d' }} />快捷入口</Space>}>
        <Row gutter={[16, 16]}>
          {[
            { title: 'POS 开单', icon: <ShoppingCartOutlined />, color: '#d4380d', path: '/pos' },
            { title: '加工看板', icon: <ToolOutlined />, color: '#722ed1', path: '/processing' },
            { title: '库存盘点', icon: <DatabaseOutlined />, color: '#52c41a', path: '/inventory' },
            { title: '采购入库', icon: <PlusOutlined />, color: '#1677ff', path: '/procurement' },
            { title: '损耗登记', icon: <WarningOutlined />, color: '#faad14', path: '/loss' },
            { title: '会员管理', icon: <IdcardOutlined />, color: '#13c2c2', path: '/members' },
            { title: '员工排班', icon: <TeamOutlined />, color: '#2f54eb', path: '/staff' },
            { title: '数据报表', icon: <BarChartOutlined />, color: '#eb2f96', path: '/reports' },
          ].map((q) => (
            <Col xs={12} sm={8} md={6} lg={3} key={q.title}>
              <div
                onClick={() => navigate(q.path)}
                style={{
                  padding: 16, borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                  background: '#fafafa', transition: 'all .25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Avatar size={44} style={{ background: q.color, marginBottom: 8 }} icon={q.icon} />
                <div style={{ fontSize: 13, color: '#262626' }}>{q.title}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
