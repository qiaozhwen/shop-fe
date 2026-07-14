import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Lock, Eye, EyeOff, Store, BarChart2, Settings, ShieldCheck, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { PHONE_REGEX } from '@/lib/sms';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setTokens = useAuthStore((s) => s.setTokens);
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
                <p className="text-text-3 text-[13px]">请输入员工账号和密码</p>
              </div>
              <PasswordForm onSuccess={goAfterLogin} setTokens={setTokens} />
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

function PasswordForm({
  onSuccess,
  setTokens,
}: {
  onSuccess: (nickname?: string) => void;
  setTokens: ReturnType<typeof useAuthStore.getState>['setTokens'];
}) {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { phone: '', password: '' },
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
      <Button type="submit" size="lg" className="w-full mt-2 h-11 text-[15px] font-semibold" disabled={loading}>
        {loading ? '登录中…' : '登 录'}
      </Button>
    </form>
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
