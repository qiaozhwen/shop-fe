import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Lock, Eye, EyeOff, MessageSquare, QrCode, Store, BarChart2, Settings, ShieldCheck, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useSmsCooldown, PHONE_REGEX } from '@/lib/sms';
import { isBindPending } from '@/types/auth';
import type { SsoProvider } from '@/types/auth';

const features = [
  { Icon: Store,      title: '多门店统一管理', desc: '一键切换，数据隔离' },
  { Icon: Settings,   title: '加工流程可视化', desc: '宰杀到分装全程追踪' },
  { Icon: BarChart2,  title: '实时经营看板',   desc: '销售/库存/损耗一目了然' },
  { Icon: ShieldCheck,title: '溯源与质检',     desc: '批次管理 + 健康记录' },
];

const phoneField = z.string().regex(PHONE_REGEX, '请输入合法的手机号');

const passwordSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, '请输入密码'),
});
type PasswordValues = z.infer<typeof passwordSchema>;

const smsSchema = z.object({
  phone: phoneField,
  code: z.string().regex(/^\d{6}$/, '请输入 6 位验证码'),
});
type SmsValues = z.infer<typeof smsSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setBindPending = useAuthStore((s) => s.setBindPending);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = (location.state as { from?: string })?.from ?? '/dashboard';
  const goAfterLogin = (nickname?: string) => {
    toast.success(nickname ? `欢迎回来，${nickname}！` : '登录成功');
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 font-['Inter',sans-serif]">
      {/* ── 左侧品牌区 ── */}
      <div className="hidden md:flex flex-col justify-between p-14 bg-gradient-to-br from-[#0F2B1F] via-[#15803D] to-[#16A34A] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/10 translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-[12px] bg-white/15 flex items-center justify-center text-2xl shadow-lg">🐔</div>
            <div>
              <div className="text-white font-bold text-lg tracking-wide">鲜禽汇 · 门店管理系统</div>
              <div className="text-white/60 text-xs mt-0.5">Live Poultry Retail Management Platform</div>
            </div>
          </div>

          <h1 className="text-white text-4xl font-bold leading-tight mb-5">
            让活禽门店<br/>
            <span className="text-[#86EFAC]">像 SaaS 一样运转</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-10">
            覆盖采购、库存、销售、加工、损耗、会员的完整数字化闭环。
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm rounded-[10px] p-3.5 flex items-center gap-3 border border-white/10">
                <div className="w-8 h-8 rounded-[8px] bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#86EFAC]" />
                </div>
                <div>
                  <div className="text-white text-[13px] font-semibold">{title}</div>
                  <div className="text-white/55 text-[11px] mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/40 text-[11px]">
          <span>© {now.year()} 鲜禽汇</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {now.format('YYYY-MM-DD HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* ── 右侧登录区 ── */}
      <div className="flex items-center justify-center p-6 bg-bg min-h-screen md:min-h-0">
        <div className="w-full max-w-[420px]">
          <div className="flex md:hidden items-center gap-2 justify-center mb-8">
            <span className="text-2xl">🐔</span>
            <span className="font-bold text-text text-lg">鲜禽汇</span>
          </div>

          <Card className="shadow-[0_8px_32px_rgba(15,43,31,0.12)]">
            <CardBody className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-[22px] font-bold text-text mb-1">欢迎登录</h2>
                <p className="text-text-3 text-[13px]">请选择登录方式</p>
              </div>

              <Tabs defaultValue="password">
                <TabsList className="grid grid-cols-3 mb-5">
                  <TabsTrigger value="password" className="justify-center">密码登录</TabsTrigger>
                  <TabsTrigger value="sms" className="justify-center">短信验证码</TabsTrigger>
                  <TabsTrigger value="sso" className="justify-center">扫码登录</TabsTrigger>
                </TabsList>

                <TabsContent value="password">
                  <PasswordTab onSuccess={goAfterLogin} setTokens={setTokens} />
                </TabsContent>
                <TabsContent value="sms">
                  <SmsTab onSuccess={goAfterLogin} setTokens={setTokens} />
                </TabsContent>
                <TabsContent value="sso">
                  <SsoTab onPending={setBindPending} onTokens={setTokens} onDone={goAfterLogin} />
                </TabsContent>
              </Tabs>

              <div className="mt-5 px-3.5 py-2.5 rounded-[8px] bg-primary-50 border border-primary-100 text-[12px] text-[#15803D] text-center">
                🔐 演示：手机号 <strong>13800000000</strong> / 密码 <strong>123456</strong>，短信验证码 <strong>123456</strong>
              </div>
            </CardBody>
          </Card>

          <p className="text-center text-[11px] text-text-3 mt-6">
            © {now.year()} 鲜禽汇 · 让生鲜门店数字化更简单
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── 密码登录 ──────────────── */

function PasswordTab({
  onSuccess,
  setTokens,
}: {
  onSuccess: (nickname?: string) => void;
  setTokens: ReturnType<typeof useAuthStore.getState>['setTokens'];
}) {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { phone: '13800000000', password: '123456' },
  });

  const onSubmit = async (v: PasswordValues) => {
    setLoading(true);
    try {
      const res = await authApi.loginWithPassword(v);
      setTokens(res, res.subject);
      onSuccess(res.subject.nickname);
    } catch {
      // 拦截器已 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field
        id="phone-pwd"
        label="手机号"
        Icon={Phone}
        autoComplete="tel"
        placeholder="请输入手机号"
        error={errors.phone?.message}
        register={register('phone')}
      />
      <div className="space-y-1.5">
        <Label htmlFor="password">密码</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
          <Input
            id="password"
            type={showPwd ? 'text' : 'password'}
            className="pl-9 pr-9"
            placeholder="请输入密码"
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2"
            onClick={() => setShowPwd((v) => !v)}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="text-danger text-[12px]">{errors.password.message}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-[12px] text-primary hover:text-primary-600"
          onClick={() => navigate('/auth/reset-password')}
        >
          忘记密码？
        </button>
      </div>
      <Button type="submit" size="lg" className="w-full mt-2 h-11 text-[15px] font-semibold" disabled={loading}>
        {loading ? '登录中…' : '登 录'}
      </Button>
    </form>
  );
}

/* ──────────────── 短信验证码登录 ──────────────── */

function SmsTab({
  onSuccess,
  setTokens,
}: {
  onSuccess: (nickname?: string) => void;
  setTokens: ReturnType<typeof useAuthStore.getState>['setTokens'];
}) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const cd = useSmsCooldown();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<SmsValues>({
    resolver: zodResolver(smsSchema),
    defaultValues: { phone: '13800000000', code: '' },
  });

  const sendCode = async () => {
    const phone = getValues('phone');
    if (!PHONE_REGEX.test(phone)) {
      toast.error('请输入合法的手机号');
      return;
    }
    setSending(true);
    try {
      const res = await authApi.sendSms({ phone, purpose: 'SMS_LOGIN' });
      cd.start(res.resendAfter || 60);
      toast.success('验证码已发送');
    } catch {
      // 拦截器已 toast
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (v: SmsValues) => {
    setLoading(true);
    try {
      const res = await authApi.loginWithSms(v);
      setTokens(res, res.subject);
      onSuccess(res.subject.nickname);
    } catch {
      // 拦截器已 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field
        id="phone-sms"
        label="手机号"
        Icon={Phone}
        autoComplete="tel"
        placeholder="请输入手机号"
        error={errors.phone?.message}
        register={register('phone')}
      />
      <div className="space-y-1.5">
        <Label htmlFor="sms-code">短信验证码</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            <Input
              id="sms-code"
              className="pl-9"
              placeholder="6 位验证码"
              maxLength={6}
              inputMode="numeric"
              {...register('code')}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-3 whitespace-nowrap text-[13px] border border-border"
            disabled={!cd.canSend || sending}
            onClick={sendCode}
          >
            {sending ? '发送中…' : cd.canSend ? '获取验证码' : `${cd.leftSeconds}s 后重发`}
          </Button>
        </div>
        {errors.code && <p className="text-danger text-[12px]">{errors.code.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full mt-2 h-11 text-[15px] font-semibold" disabled={loading}>
        {loading ? '登录中…' : '登 录'}
      </Button>
    </form>
  );
}

/* ──────────────── 扫码登录 ──────────────── */

function SsoTab({
  onPending,
  onTokens,
  onDone,
}: {
  onPending: ReturnType<typeof useAuthStore.getState>['setBindPending'];
  onTokens: ReturnType<typeof useAuthStore.getState>['setTokens'];
  onDone: (nickname?: string) => void;
}) {
  const [provider, setProvider] = useState<SsoProvider>('WECHAT');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const navigate = useNavigate();

  const start = async (p: SsoProvider) => {
    setProvider(p);
    setLoading(true);
    setQrUrl(null);
    try {
      const redirectUri = `${window.location.origin}/auth/sso/callback?provider=${p}`;
      const res = await authApi.startSso(p, { redirectUri });
      setQrUrl(res.qrUrl);
      setState(res.state);
    } catch {
      // 拦截器 toast
    } finally {
      setLoading(false);
    }
  };

  // 演示用「我已扫码」入口：mock 场景下用这个直接走 exchange
  const simulateExchange = async () => {
    if (!state) return;
    setExchanging(true);
    try {
      const res = await authApi.exchangeSso(provider, { code: 'MOCK_CODE', state });
      if (isBindPending(res)) {
        onPending(res.bindToken, res.bindTokenExpiresIn, res.provider, res.profile);
        navigate('/auth/bind-phone', { replace: true });
        return;
      }
      onTokens(res, res.subject);
      onDone(res.subject.nickname);
    } catch {
      // 拦截器 toast
    } finally {
      setExchanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['WECHAT', 'ALIPAY'] as SsoProvider[]).map((p) => (
          <Button
            key={p}
            type="button"
            variant={provider === p ? 'primary' : 'ghost'}
            className="flex-1 h-9 text-[13px]"
            onClick={() => start(p)}
          >
            {p === 'WECHAT' ? '微信扫码' : '支付宝扫码'}
          </Button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[220px] border border-dashed border-border rounded-[10px] p-4 bg-bg">
        {loading && <p className="text-text-3 text-[13px]">正在生成二维码…</p>}
        {!loading && !qrUrl && (
          <div className="flex flex-col items-center text-text-3">
            <QrCode size={48} />
            <p className="text-[13px] mt-2">点击上方按钮生成二维码</p>
          </div>
        )}
        {!loading && qrUrl && (
          <div className="flex flex-col items-center gap-3">
            <img src={qrUrl} alt="qr" className="w-40 h-40 bg-white p-2 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <p className="text-[12px] text-text-3">请使用 {provider === 'WECHAT' ? '微信' : '支付宝'} 扫描二维码</p>
            <Button type="button" variant="ghost" className="h-8 text-[12px] border border-border" onClick={simulateExchange} disabled={exchanging}>
              {exchanging ? '处理中…' : '我已扫码（演示）'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────── 通用字段 ──────────────── */

function Field({
  id,
  label,
  Icon,
  placeholder,
  autoComplete,
  error,
  register,
  type = 'text',
}: {
  id: string;
  label: string;
  Icon: typeof Phone;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  register: ReturnType<ReturnType<typeof useForm<any>>['register']>;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
        <Input id={id} type={type} className="pl-9" placeholder={placeholder} autoComplete={autoComplete} {...register} />
      </div>
      {error && <p className="text-danger text-[12px]">{error}</p>}
    </div>
  );
}
