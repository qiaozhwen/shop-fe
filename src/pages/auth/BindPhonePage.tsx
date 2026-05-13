import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useSmsCooldown, PHONE_REGEX } from '@/lib/sms';

const schema = z.object({
  phone: z.string().regex(PHONE_REGEX, '请输入合法的手机号'),
  smsCode: z.string().regex(/^\d{6}$/, '请输入 6 位验证码'),
});
type Values = z.infer<typeof schema>;

export default function BindPhonePage() {
  const navigate = useNavigate();
  const bindPending = useAuthStore((s) => s.bindPending);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearBindPending = useAuthStore((s) => s.clearBindPending);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const cd = useSmsCooldown();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', smsCode: '' },
  });

  if (!bindPending) {
    return (
      <CenteredCard
        title="链接已失效"
        description="未找到待绑定的扫码会话，请重新扫码登录。"
        action={<Button onClick={() => navigate('/login', { replace: true })}>返回登录</Button>}
      />
    );
  }

  if (Date.now() > bindPending.bindTokenExpiresAt) {
    return (
      <CenteredCard
        title="绑定会话已过期"
        description="为保证账号安全，请重新扫码登录。"
        action={
          <Button
            onClick={() => {
              clearBindPending();
              navigate('/login', { replace: true });
            }}
          >
            返回登录
          </Button>
        }
      />
    );
  }

  const sendCode = async () => {
    const phone = getValues('phone');
    if (!PHONE_REGEX.test(phone)) {
      toast.error('请输入合法的手机号');
      return;
    }
    setSending(true);
    try {
      const res = await authApi.sendSms({ phone, purpose: 'BIND_PHONE' });
      cd.start(res.resendAfter || 60);
      toast.success('验证码已发送');
    } catch { /* toast handled */ } finally { setSending(false); }
  };

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const res = await authApi.bindPhone(
        { phone: v.phone, smsCode: v.smsCode },
        bindPending.bindToken,
      );
      setTokens(res, res.subject);
      toast.success('绑定成功');
      navigate('/dashboard', { replace: true });
    } catch { /* toast handled */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-[420px]">
        <Card className="shadow-[0_8px_32px_rgba(15,43,31,0.12)]">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              {bindPending.profile.avatarUrl ? (
                <img src={bindPending.profile.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base font-semibold">
                  {bindPending.profile.nickname?.[0] ?? '?'}
                </div>
              )}
              <div>
                <div className="text-[14px] font-semibold text-text">
                  你好，{bindPending.profile.nickname ?? '新用户'}
                </div>
                <div className="text-[12px] text-text-3">
                  {bindPending.provider === 'WECHAT' ? '微信' : '支付宝'} 已识别 · 请绑定手机号
                </div>
              </div>
            </div>

            <p className="text-[12px] text-text-3 mb-4 leading-relaxed">
              手机号是你的唯一身份。如该手机号已存在 staff 账号将自动关联；否则会自动为你创建账号（默认最小角色，等管理员授权）。
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bp-phone">手机号</Label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                  <Input id="bp-phone" className="pl-9" placeholder="请输入手机号" autoComplete="tel" {...register('phone')} />
                </div>
                {errors.phone && <p className="text-danger text-[12px]">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-code">短信验证码</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                    <Input id="bp-code" className="pl-9" placeholder="6 位验证码" maxLength={6} inputMode="numeric" {...register('smsCode')} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-3 text-[13px] border border-border whitespace-nowrap"
                    disabled={!cd.canSend || sending}
                    onClick={sendCode}
                  >
                    {sending ? '发送中…' : cd.canSend ? '获取验证码' : `${cd.leftSeconds}s 后重发`}
                  </Button>
                </div>
                {errors.smsCode && <p className="text-danger text-[12px]">{errors.smsCode.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full h-11 text-[15px] font-semibold" disabled={loading}>
                {loading ? '绑定中…' : '完成绑定并登录'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-9 text-[13px]"
                onClick={() => {
                  clearBindPending();
                  navigate('/login', { replace: true });
                }}
              >
                取消，返回登录
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function CenteredCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <Card className="w-full max-w-[400px]">
        <CardBody className="p-8 text-center space-y-3">
          <h2 className="text-[18px] font-bold text-text">{title}</h2>
          <p className="text-[13px] text-text-3">{description}</p>
          <div className="pt-2">{action}</div>
        </CardBody>
      </Card>
    </div>
  );
}
