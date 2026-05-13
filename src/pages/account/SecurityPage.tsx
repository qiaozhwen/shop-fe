import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useSmsCooldown, maskPhone } from '@/lib/sms';
import type { SsoProvider } from '@/types/auth';

const setPwdSchemaWithOld = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: z.string().min(6, '密码至少 6 位').max(64, '密码过长'),
});
type SetPwdValuesWithOld = z.infer<typeof setPwdSchemaWithOld>;

const setPwdSchemaWithSms = z.object({
  smsCode: z.string().regex(/^\d{6}$/, '请输入 6 位验证码'),
  newPassword: z.string().min(6, '密码至少 6 位').max(64, '密码过长'),
});
type SetPwdValuesWithSms = z.infer<typeof setPwdSchemaWithSms>;

export default function SecurityPage() {
  const subject = useAuthStore((s) => s.subject);
  const setSubject = useAuthStore((s) => s.setSubject);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const navigate = useNavigate();

  const reloadMe = async () => {
    try {
      const me = await authApi.me();
      setSubject(me);
    } catch { /* ignore */ }
  };

  const onLogout = async () => {
    try { await authApi.logout(refreshToken ?? undefined); } catch { /* ignore */ }
    clear();
    navigate('/login', { replace: true });
  };

  if (!subject) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardBody className="p-6">
          <h3 className="text-[16px] font-semibold text-text mb-4">账号信息</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-[13px]">
            <Item label="昵称">{subject.nickname || '—'}</Item>
            <Item label="手机号">{maskPhone(subject.phone)}</Item>
            <Item label="角色">{subject.roles?.join(', ') || '—'}</Item>
            <Item label="是否设置密码">{subject.hasPassword ? '已设置' : '未设置'}</Item>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" size="sm" onClick={reloadMe}>刷新</Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>退出登录</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h3 className="text-[16px] font-semibold text-text mb-4">登录密码</h3>
          {subject.hasPassword
            ? <ChangePasswordForm onDone={reloadMe} />
            : <SetFirstPasswordForm phone={subject.phone} onDone={reloadMe} />}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h3 className="text-[16px] font-semibold text-text mb-4">第三方登录</h3>
          <BindList bound={subject.boundProviders ?? []} onChanged={reloadMe} />
        </CardBody>
      </Card>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-24 text-text-3">{label}</span>
      <span className="text-text font-medium">{children}</span>
    </div>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SetPwdValuesWithOld>({
    resolver: zodResolver(setPwdSchemaWithOld),
  });
  const onSubmit = async (v: SetPwdValuesWithOld) => {
    setLoading(true);
    try {
      await authApi.setPassword(v);
      toast.success('密码已更新');
      reset();
      onDone();
    } catch { /* toast handled */ } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 max-w-md">
      <div className="space-y-1.5">
        <Label htmlFor="cp-old">原密码</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
          <Input id="cp-old" type="password" className="pl-9" {...register('oldPassword')} />
        </div>
        {errors.oldPassword && <p className="text-danger text-[12px]">{errors.oldPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cp-new">新密码</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
          <Input id="cp-new" type="password" className="pl-9" {...register('newPassword')} />
        </div>
        {errors.newPassword && <p className="text-danger text-[12px]">{errors.newPassword.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>{loading ? '保存中…' : '保存'}</Button>
    </form>
  );
}

function SetFirstPasswordForm({ phone, onDone }: { phone: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const cd = useSmsCooldown();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SetPwdValuesWithSms>({
    resolver: zodResolver(setPwdSchemaWithSms),
  });

  const sendCode = async () => {
    setSending(true);
    try {
      const res = await authApi.sendSms({ phone, purpose: 'SET_PASSWORD' });
      cd.start(res.resendAfter || 60);
      toast.success('验证码已发送至当前账号手机号');
    } catch { /* toast handled */ } finally { setSending(false); }
  };

  const onSubmit = async (v: SetPwdValuesWithSms) => {
    setLoading(true);
    try {
      await authApi.setPassword(v);
      toast.success('密码已设置');
      reset();
      onDone();
    } catch { /* toast handled */ } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 max-w-md">
      <p className="text-[12px] text-text-3">
        当前账号未设置密码（仅扫码登录）。需先用 {maskPhone(phone)} 接收短信验证码。
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="sp-code">短信验证码</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            <Input id="sp-code" className="pl-9" placeholder="6 位验证码" maxLength={6} {...register('smsCode')} />
          </div>
          <Button type="button" variant="ghost" className="h-9 px-3 text-[13px] border border-border whitespace-nowrap" disabled={!cd.canSend || sending} onClick={sendCode}>
            {sending ? '发送中…' : cd.canSend ? '获取验证码' : `${cd.leftSeconds}s 后重发`}
          </Button>
        </div>
        {errors.smsCode && <p className="text-danger text-[12px]">{errors.smsCode.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sp-new">新密码</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
          <Input id="sp-new" type="password" className="pl-9" {...register('newPassword')} />
        </div>
        {errors.newPassword && <p className="text-danger text-[12px]">{errors.newPassword.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>{loading ? '保存中…' : '设置密码'}</Button>
    </form>
  );
}

function BindList({ bound, onChanged }: { bound: SsoProvider[]; onChanged: () => void }) {
  const all: { p: SsoProvider; label: string }[] = [
    { p: 'WECHAT', label: '微信' },
    { p: 'ALIPAY', label: '支付宝' },
  ];

  const unbind = async (p: SsoProvider) => {
    if (!confirm(`确认解绑${p === 'WECHAT' ? '微信' : '支付宝'}？`)) return;
    try {
      await authApi.unbindProvider(p);
      toast.success('已解绑');
      onChanged();
    } catch { /* toast handled */ }
  };

  const bind = async (p: SsoProvider) => {
    toast.info(`绑定${p === 'WECHAT' ? '微信' : '支付宝'}：请退出后重新走扫码登录绑定流程。`);
  };

  return (
    <div className="space-y-2 max-w-md">
      {all.map(({ p, label }) => {
        const isBound = bound.includes(p);
        return (
          <div key={p} className="flex items-center justify-between border border-border rounded-[10px] px-4 py-3">
            <div>
              <div className="text-[14px] text-text font-medium">{label}</div>
              <div className="text-[12px] text-text-3">{isBound ? '已绑定' : '未绑定'}</div>
            </div>
            {isBound ? (
              <Button size="sm" variant="ghost" onClick={() => unbind(p)}>解绑</Button>
            ) : (
              <Button size="sm" onClick={() => bind(p)}>去绑定</Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
