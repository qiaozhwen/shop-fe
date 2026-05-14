import { useEffect, useRef, useState } from 'react';

/**
 * 短信验证码倒计时 hook。
 * - start(seconds) 启动倒计时；leftSeconds 为剩余秒数；canSend 当 leftSeconds === 0 时为 true。
 */
export function useSmsCooldown(initial = 0) {
  const [left, setLeft] = useState(initial);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const start = (seconds: number) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setLeft(seconds);
    timerRef.current = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  return { leftSeconds: left, canSend: left === 0, start };
}

export const PHONE_REGEX = /^1[3-9]\d{9}$/;

export function maskPhone(phone?: string) {
  if (!phone || phone.length < 7) return phone ?? '';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
