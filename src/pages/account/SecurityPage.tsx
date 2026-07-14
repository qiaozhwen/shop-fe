import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { maskPhone } from '@/lib/sms';

const setPwdSchemaWithOld = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: z.string().min(6, '密码至少 6 位').max(64, '密码过长'),
});
type SetPwdValuesWithOld = z.infer<typeof setPwdSchemaWithOld>;

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
            : <p className="text-[13px] text-text-3">当前账号尚未设置密码，请联系系统管理员初始化账号。</p>}
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
