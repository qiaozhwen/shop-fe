import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, MessageSquare, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useSmsCooldown, PHONE_REGEX } from '@/lib/sms';

const schema = z.object({
  phone: z.string().regex(PHONE_REGEX, '请输入合法的手机号'),
  smsCode: z.string().regex(/^\d{6}$/, '请输入 6 位验证码'),
  newPassword: z.string().min(6, '密码至少 6 位').max(64, '密码过长'),
});
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const cd = useSmsCooldown();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const sendCode = async () => {
    const phone = getValues('phone');
    if (!PHONE_REGEX.test(phone)) {
      toast.error('请输入合法的手机号');
      return;
    }
    setSending(true);
    try {
      const res = await authApi.sendSms({ phone, purpose: 'RESET_PASSWORD' });
      cd.start(res.resendAfter || 60);
      toast.success('验证码已发送');
    } catch { /* toast handled */ } finally { setSending(false); }
  };

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      await authApi.resetPassword(v);
      toast.success('密码已重置，请登录');
      navigate('/login', { replace: true });
    } catch { /* toast handled */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-[420px]">
        <Card className="shadow-[0_8px_32px_rgba(15,43,31,0.12)]">
          <CardBody className="p-8">
            <h2 className="text-[20px] font-bold text-text mb-1">重置密码</h2>
            <p className="text-[13px] text-text-3 mb-6">通过手机号 + 短信验证码设置新密码</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rp-phone">手机号</Label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                  <Input id="rp-phone" className="pl-9" placeholder="请输入手机号" autoComplete="tel" {...register('phone')} />
                </div>
                {errors.phone && <p className="text-danger text-[12px]">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rp-code">短信验证码</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                    <Input id="rp-code" className="pl-9" placeholder="6 位验证码" maxLength={6} inputMode="numeric" {...register('smsCode')} />
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

              <div className="space-y-1.5">
                <Label htmlFor="rp-pwd">新密码</Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                  <Input
                    id="rp-pwd"
                    type={showPwd ? 'text' : 'password'}
                    className="pl-9 pr-9"
                    placeholder="至少 6 位"
                    autoComplete="new-password"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2"
                    onClick={() => setShowPwd((v) => !v)}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-danger text-[12px]">{errors.newPassword.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full h-11 text-[15px] font-semibold" disabled={loading}>
                {loading ? '提交中…' : '重置密码'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-9 text-[13px]"
                onClick={() => navigate('/login', { replace: true })}
              >
                返回登录
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
