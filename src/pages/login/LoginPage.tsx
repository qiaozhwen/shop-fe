import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api/modules/peopleApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Eye, EyeOff, Store, BarChart2, Settings, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import dayjs from 'dayjs';
import { useEffect } from 'react';

const schema = z.object({
  username: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const features = [
  { Icon: Store,      title: '多门店统一管理', desc: '一键切换，数据隔离' },
  { Icon: Settings,   title: '加工流程可视化', desc: '宰杀到分装全程追踪' },
  { Icon: BarChart2,  title: '实时经营看板',   desc: '销售/库存/损耗一目了然' },
  { Icon: ShieldCheck,title: '溯源与质检',     desc: '批次管理 + 健康记录' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: 'admin', password: '123456', remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      setAuth(res.token, res.user);
      localStorage.setItem('token', res.token);
      toast.success(`欢迎回来，${res.user.nickname}！`);
      const target = (location.state as { from?: string })?.from ?? '/dashboard';
      navigate(target, { replace: true });
    } catch {
      // error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 font-['Inter',sans-serif]">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden md:flex flex-col justify-between p-14 bg-gradient-to-br from-[#0F2B1F] via-[#15803D] to-[#16A34A] relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/10 translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-[12px] bg-white/15 flex items-center justify-center text-2xl shadow-lg">
              🐔
            </div>
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
            覆盖采购、库存、销售、加工、损耗、会员的完整数字化闭环，让经营更高效、追溯更透明。
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

      {/* ── Right login panel ── */}
      <div className="flex items-center justify-center p-6 bg-bg min-h-screen md:min-h-0">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 justify-center mb-8">
            <span className="text-2xl">🐔</span>
            <span className="font-bold text-text text-lg">鲜禽汇</span>
          </div>

          <Card className="shadow-[0_8px_32px_rgba(15,43,31,0.12)]">
            <CardBody className="p-9">
              <div className="text-center mb-8">
                <h2 className="text-[22px] font-bold text-text mb-1">欢迎登录</h2>
                <p className="text-text-3 text-[13px]">请使用门店账号登录系统</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username">账号 / 工号</Label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                    <Input
                      id="username"
                      className="pl-9"
                      placeholder="请输入账号"
                      autoComplete="username"
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-danger text-[12px]">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors"
                      onClick={() => setShowPwd((v) => !v)}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-danger text-[12px]">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-primary rounded"
                      {...register('remember')}
                    />
                    <span className="text-[13px] text-text-2">记住账号</span>
                  </label>
                  <button
                    type="button"
                    className="text-[13px] text-primary hover:text-primary-600 transition-colors"
                    onClick={() => toast.info('请联系管理员重置密码')}
                  >
                    忘记密码？
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-2 h-11 text-[15px] font-semibold"
                  disabled={loading}
                >
                  {loading ? '登录中…' : '登 录'}
                </Button>
              </form>

              {/* Demo hint */}
              <div className="mt-6 px-3.5 py-2.5 rounded-[8px] bg-primary-50 border border-primary-100 text-[12px] text-[#15803D] text-center">
                🔐 演示账号：<strong>admin</strong> / <strong>123456</strong>
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
