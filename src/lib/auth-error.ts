import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  retryAfterSeconds?: number;
  provider?: string;
}

/**
 * 把后端认证类错误（按 HTTP 状态 + body.message）转成可读 toast。
 * 返回 true 表示已处理；false 表示交回调用方处理。
 */
export function toastAuthError(err: unknown): boolean {
  const e = err as AxiosError<ApiErrorBody>;
  const status = e?.response?.status;
  const body = e?.response?.data ?? {};
  const msg = body.message;

  switch (status) {
    case 400:
      toast.error(msg || '请求参数错误');
      return true;
    case 401:
      // 由 axios client 401 拦截器统一处理刷新/跳转，这里只静默
      return true;
    case 403:
      toast.error(msg || '没有权限');
      return true;
    case 409:
      toast.error(msg || '操作冲突');
      return true;
    case 423: {
      const sec = body.retryAfterSeconds;
      toast.error(
        sec
          ? `账号已锁定，请 ${Math.ceil(sec / 60)} 分钟后再试`
          : msg || '账号已锁定',
      );
      return true;
    }
    case 429: {
      const sec = body.retryAfterSeconds;
      toast.error(
        sec
          ? `操作过于频繁，请 ${sec} 秒后再试`
          : msg || '请求过于频繁',
      );
      return true;
    }
    case 502:
      toast.error(`${body.provider ?? '第三方'} 登录暂不可用，请稍后重试`);
      return true;
    default:
      if (msg) {
        toast.error(msg);
        return true;
      }
      return false;
  }
}
