import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/modules/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { isBindPending, type SsoProvider } from '@/types/auth';
import { toast } from 'sonner';

export default function SsoCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setBindPending = useAuthStore((s) => s.setBindPending);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const provider = (params.get('provider')?.toUpperCase() ?? 'WECHAT') as SsoProvider;
  const code = params.get('code');
  const state = params.get('state');

  useEffect(() => {
    if (!code || !state) {
      setErrMsg('回调参数缺失');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.exchangeSso(provider, { code, state });
        if (cancelled) return;
        if (isBindPending(res)) {
          setBindPending(res.bindToken, res.bindTokenExpiresIn, res.provider, res.profile);
          navigate('/auth/bind-phone', { replace: true });
          return;
        }
        setTokens(res, res.subject);
        toast.success('登录成功');
        navigate('/dashboard', { replace: true });
      } catch {
        if (!cancelled) setErrMsg('登录失败，请返回重试');
      }
    })();
    return () => { cancelled = true; };
  }, [code, state, provider, navigate, setTokens, setBindPending]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <Card className="w-full max-w-[400px]">
        <CardBody className="p-8 text-center space-y-3">
          {!errMsg ? (
            <>
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-border border-t-primary animate-spin" />
              <p className="text-[14px] text-text">正在登录中…</p>
              <p className="text-[12px] text-text-3">{provider === 'WECHAT' ? '微信' : '支付宝'} 授权确认中</p>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-bold text-text">登录失败</h2>
              <p className="text-[13px] text-text-3">{errMsg}</p>
              <Button onClick={() => navigate('/login', { replace: true })}>返回登录</Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
