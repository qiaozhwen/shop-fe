import { Form, Input, Button, Checkbox, Tabs, Divider, Space, App as AntdApp } from 'antd';
import {
  UserOutlined, LockOutlined, MobileOutlined, SafetyCertificateOutlined,
  WechatOutlined, AlipayOutlined, ShopOutlined, SafetyOutlined,
  ClockCircleOutlined, DashboardOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api/modules/peopleApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntdApp.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [smsCountdown, setSmsCountdown] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const t = setTimeout(() => setSmsCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [smsCountdown]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      setAuth(res.token, res.user);
      localStorage.setItem('token', res.token);
      message.success(`欢迎回来，${res.user.nickname}！`);
      const target = (location.state as any)?.from || '/dashboard';
      navigate(target, { replace: true });
    } catch {
      // intercepted
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <ShopOutlined />, title: '多门店统一管理', desc: '一键切换，数据隔离' },
    { icon: <ToolOutlined />, title: '加工流程可视化', desc: '宰杀到分装全程追踪' },
    { icon: <DashboardOutlined />, title: '实时经营看板', desc: '销售/库存/损耗一目了然' },
    { icon: <SafetyOutlined />, title: '溯源与质检', desc: '批次管理 + 健康记录' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #fff1e6 0%, #ffe7ba 50%, #ffd591 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute', top: -120, left: -120, width: 360, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,56,13,0.18) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -160, right: -80, width: 460, height: 460,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(250,140,22,0.20) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '38%', width: 220, height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
      }} />

      {/* 左侧品牌区 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '60px 80px', position: 'relative', zIndex: 1,
        minWidth: 480,
      }} className="login-brand">
        <div>
          <Space size={14} align="center" style={{ marginBottom: 60 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #d4380d 0%, #fa8c16 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(212,56,13,0.35)',
              fontSize: 28,
            }}>🐔</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#262626', letterSpacing: 1 }}>
                鲜禽汇 · 门店管理系统
              </div>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
                Live Poultry Retail Management Platform
              </div>
            </div>
          </Space>

          <h1 style={{
            fontSize: 42, lineHeight: 1.25, fontWeight: 700, color: '#262626',
            marginBottom: 20, marginTop: 0,
          }}>
            从<span style={{ color: '#d4380d' }}>活禽进栏</span>到<br/>
            <span style={{ color: '#fa541c' }}>现杀出货</span>，一站搞定
          </h1>
          <p style={{ fontSize: 15, color: '#595959', maxWidth: 460, lineHeight: 1.7, marginBottom: 36 }}>
            为活禽现杀销售门店量身打造的数字化经营工具，覆盖采购、库存、销售、加工、损耗、会员的完整闭环，让经营更高效、追溯更透明。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 520 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, fontSize: 18,
                  background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                  color: '#d4380d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{f.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8c8c8c', fontSize: 12 }}>
          <span>© {now.year()} 鲜禽汇 · 让生鲜门店数字化更简单</span>
          <Space size={4} style={{ color: '#595959' }}>
            <ClockCircleOutlined />
            {now.format('YYYY-MM-DD HH:mm:ss')}
          </Space>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div style={{
        width: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, position: 'relative', zIndex: 1,
      }} className="login-panel">
        <div style={{
          width: '100%', maxWidth: 400,
          background: '#fff', borderRadius: 18, padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(212,56,13,0.18), 0 8px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#262626', marginBottom: 6 }}>
              欢迎登录
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c' }}>
              请使用门店账号登录系统
            </div>
          </div>

          <Tabs
            defaultActiveKey="account"
            centered
            items={[
              {
                key: 'account', label: '账号登录',
                children: (
                  <Form
                    layout="vertical"
                    initialValues={{ username: 'admin', password: '123456', remember: true }}
                    onFinish={onFinish}
                    requiredMark={false}
                  >
                    <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
                      <Input
                        prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="账号 / 工号"
                        size="large"
                        autoComplete="username"
                      />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="密码"
                        size="large"
                        autoComplete="current-password"
                      />
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>记住账号</Checkbox>
                      </Form.Item>
                      <a style={{ color: '#d4380d', fontSize: 13 }} onClick={(e) => { e.preventDefault(); message.info('请联系管理员重置密码'); }}>
                        忘记密码？
                      </a>
                    </div>
                    <Button
                      type="primary" htmlType="submit" block size="large" loading={loading}
                      style={{
                        height: 46, fontSize: 15, fontWeight: 500,
                        background: 'linear-gradient(135deg, #d4380d 0%, #fa541c 100%)',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(212,56,13,0.25)',
                      }}
                    >
                      登 录
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'sms', label: '短信登录',
                children: (
                  <Form
                    layout="vertical"
                    onFinish={() => message.info('演示模式，请使用账号登录')}
                    requiredMark={false}
                  >
                    <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '手机号格式错误' }]}>
                      <Input
                        prefix={<MobileOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="手机号"
                        size="large"
                        maxLength={11}
                      />
                    </Form.Item>
                    <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                      <Input
                        prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="短信验证码"
                        size="large"
                        maxLength={6}
                        suffix={
                          <Button
                            type="link" size="small" disabled={smsCountdown > 0}
                            onClick={() => { setSmsCountdown(60); message.success('验证码已发送'); }}
                            style={{ color: '#d4380d', padding: 0 }}
                          >
                            {smsCountdown > 0 ? `${smsCountdown}s 后重发` : '获取验证码'}
                          </Button>
                        }
                      />
                    </Form.Item>
                    <Button
                      type="primary" htmlType="submit" block size="large"
                      style={{
                        height: 46, fontSize: 15, fontWeight: 500, marginTop: 8,
                        background: 'linear-gradient(135deg, #d4380d 0%, #fa541c 100%)',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(212,56,13,0.25)',
                      }}
                    >
                      登 录
                    </Button>
                  </Form>
                ),
              },
            ]}
          />

          <Divider plain style={{ color: '#bfbfbf', fontSize: 12, margin: '24px 0 16px' }}>
            其他登录方式
          </Divider>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div
              style={socialBtn('#07c160')}
              onClick={() => message.info('微信扫码登录开发中')}
            ><WechatOutlined /></div>
            <div
              style={socialBtn('#1677ff')}
              onClick={() => message.info('支付宝登录开发中')}
            ><AlipayOutlined /></div>
            <div
              style={socialBtn('#fa8c16')}
              onClick={() => message.info('门店扫码登录开发中')}
            ><ShopOutlined /></div>
          </div>

          <div style={{
            marginTop: 24, padding: '10px 14px', borderRadius: 8,
            background: 'linear-gradient(135deg, #fff7e6 0%, #fff1e6 100%)',
            border: '1px dashed #ffd591',
            fontSize: 12, color: '#874d00', textAlign: 'center',
          }}>
            🔐 演示账号：<strong>admin</strong> / <strong>123456</strong>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-brand { display: none !important; }
          .login-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

function socialBtn(color: string): React.CSSProperties {
  return {
    width: 42, height: 42, borderRadius: '50%',
    border: `1px solid ${color}33`,
    color, fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .25s',
    background: '#fff',
  };
}
