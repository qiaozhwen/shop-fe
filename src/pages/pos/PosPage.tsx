import { useMemo, useState } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, Printer, User, Store as StoreIcon,
  Drumstick, Bird, Rabbit, Egg, Tag as TagIcon, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/pill';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { useAllPoultry } from '@/hooks/usePoultry';
import { useSalesOrderMutations } from '@/hooks/useSalesOrders';
import { useAppStore } from '@/store/useAppStore';
import { useAllStores } from '@/hooks/useStores';
import type { PoultryCategory, ProcessMethod } from '@/types/poultry';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';
import type { PayMethod } from '@/types/order';
import { PAY_METHOD_LABEL } from '@/types/order';

interface CartItem {
  categoryId: number;
  categoryName: string;
  unitPrice: number;
  unit: PoultryCategory['unit'];
  quantity: number;
  weight: number;
  processMethod: ProcessMethod;
  processFee: number;
  processFeePerPiece: number;
}

const PROCESS_OPTIONS: ProcessMethod[] = ['ALIVE', 'SLAUGHTER', 'EVISCERATE', 'CHOP', 'TRIM_HEAD_FEET', 'PACK'];

const PAY_METHODS: PayMethod[] = ['CASH', 'WECHAT', 'ALIPAY', 'CARD', 'MEMBER'];

const SPECIES_ICON: Record<string, typeof Drumstick> = {
  鸡: Drumstick,
  鸭: Bird,
  鹅: Bird,
  鸽: Bird,
  鹌鹑: Egg,
  兔: Rabbit,
  其他: TagIcon,
};

const UNIT_LABEL: Record<string, string> = { JIN: '斤', KG: '千克', PIECE: '只' };

export default function PosPage() {
  const { data: cats } = useAllPoultry();
  const { data: stores } = useAllStores();
  const { currentStoreId, setCurrentStore } = useAppStore();
  const { create } = useSalesOrderMutations();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('CASH');
  const [phone, setPhone] = useState('');
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');

  const total = useMemo(
    () => cart.reduce((s: number, c: CartItem) =>
      s + (c.unit === 'PIECE' ? c.quantity : c.weight) * c.unitPrice + c.processFee, 0),
    [cart],
  );
  const payable = Math.max(0, total - discount);
  const totalPieces = useMemo(
    () => cart.reduce((s: number, c: CartItem) => s + c.quantity, 0),
    [cart],
  );

  const addToCart = (id: number) => {
    const cat = cats?.find((c: PoultryCategory) => c.id === id);
    if (!cat) return;
    if (cart.find((c: CartItem) => c.categoryId === id)) {
      toast.info('已在购物车中');
      return;
    }
    setCart([
      ...cart,
      {
        categoryId: cat.id,
        categoryName: cat.name,
        unitPrice: cat.basePrice,
        unit: cat.unit,
        quantity: 1,
        weight: cat.avgWeight,
        processMethod: 'SLAUGHTER',
        processFeePerPiece: cat.processingFee,
        processFee: cat.processingFee,
      },
    ]);
  };

  const update = (idx: number, patch: Partial<CartItem>) => {
    setCart((arr: CartItem[]) =>
      arr.map((c: CartItem, i: number) => {
        if (i !== idx) return c;
        const next: CartItem = { ...c, ...patch };
        next.processFee = next.processMethod === 'ALIVE' ? 0 : next.processFeePerPiece * next.quantity;
        return next;
      }),
    );
  };

  const remove = (idx: number) => setCart((arr: CartItem[]) => arr.filter((_: CartItem, i: number) => i !== idx));

  const submit = async () => {
    if (!currentStoreId) {
      toast.warning('请先选择门店');
      return;
    }
    if (cart.length === 0) {
      toast.warning('请添加商品');
      return;
    }
    try {
      const order = await create.mutateAsync({
        storeId: currentStoreId,
        customerPhone: phone || undefined,
        payMethod,
        discount,
        items: cart.map((c: CartItem) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          quantity: c.quantity,
          weight: c.weight,
          unitPrice: c.unitPrice,
          processMethod: c.processMethod,
          processFee: c.processFee,
          subtotal: (c.unit === 'PIECE' ? c.quantity : c.weight) * c.unitPrice + c.processFee,
        })),
      });
      toast.success(`下单成功：${order.orderNo}`);
      setCart([]);
      setDiscount(0);
      setPhone('');
    } catch {
      // intercepted
    }
  };

  const enabledCats = (cats ?? []).filter((c: PoultryCategory) => c.enabled);

  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-2rem)] xl:min-h-[760px]">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-[10px] bg-primary text-white flex items-center justify-center shadow-[var(--shadow-sm)]">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-text leading-tight">收银工作台</div>
            <div className="text-[12px] text-text-3">触屏快速下单</div>
          </div>
        </div>
        <div className="hidden sm:block flex-1" />
        <div className="flex w-full sm:w-auto items-center gap-2 px-3 h-12 rounded-[8px] bg-surface border border-border">
          <StoreIcon className="w-4 h-4 text-primary" />
          <span className="text-[13px] text-text-2">门店</span>
          <Select
            value={currentStoreId ? String(currentStoreId) : undefined}
            onValueChange={(v: string) => setCurrentStore(Number(v))}
          >
            <SelectTrigger className="h-10 min-w-0 sm:min-w-[180px] flex-1 border-0 bg-transparent focus:ring-0 text-[14px] font-medium">
              <SelectValue placeholder="请选择门店" />
            </SelectTrigger>
            <SelectContent>
              {(stores ?? []).map((s: { id: number; name: string }) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="lg"
          className="h-12 px-5 text-[14px] sm:w-auto w-full"
          onClick={() => setMemberOpen(true)}
        >
          <User className="w-5 h-5" />
          会员
        </Button>
      </div>

      {/* 3-column workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1.3fr_1fr] gap-4 xl:flex-1 xl:min-h-0">
        {/* LEFT: Category picker */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-primary" />
              <span className="text-[14px] font-semibold">商品品类</span>
            </div>
            <Pill tone="info">{enabledCats.length} 项可选</Pill>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enabledCats.map((c: PoultryCategory) => {
                const Icon = SPECIES_ICON[c.species] ?? TagIcon;
                const inCart = cart.some((ci: CartItem) => ci.categoryId === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => addToCart(c.id)}
                    className={cn(
                      'group relative flex flex-col items-start gap-2 p-4 rounded-[12px] border bg-surface text-left',
                      'min-h-[140px] transition active:scale-[.98]',
                      inCart
                        ? 'border-primary bg-primary-50 shadow-[var(--shadow-sm)]'
                        : 'border-border hover:border-primary hover:bg-primary-50/40',
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-12 h-12 rounded-[10px] bg-primary-50 text-primary flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      {inCart && (
                        <span className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[15px] font-semibold text-text leading-tight">{c.name}</div>
                    <div className="text-[11px] text-text-3 -mt-1">{c.species}</div>
                    <div className="mt-auto w-full flex items-end justify-between">
                      <div className="text-[20px] font-bold text-primary tnum leading-none">
                        ¥{c.basePrice.toFixed(2)}
                        <span className="text-[11px] text-text-3 font-medium ml-0.5">
                          /{UNIT_LABEL[c.unit] ?? c.unit}
                        </span>
                      </div>
                      {c.processingFee > 0 && (
                        <Pill tone="warn" className="shrink-0">
                          加工 ¥{c.processingFee}
                        </Pill>
                      )}
                    </div>
                  </button>
                );
              })}
              {enabledCats.length === 0 && (
                <div className="col-span-2 sm:col-span-3 py-16 text-center text-text-3 text-[13px]">
                  暂无可售品类
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* CENTER: Cart */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="text-[14px] font-semibold">当前订单</span>
              <Pill tone="up">{cart.length} 项 / {totalPieces} 只</Pill>
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-danger border-danger/30 hover:bg-[#FEE2E2]">
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-3 gap-3">
                <div className="w-20 h-20 rounded-full bg-[#F1F3EE] flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-text-3" />
                </div>
                <div className="text-[14px]">请从左侧选择品类</div>
              </div>
            ) : (
              cart.map((item: CartItem, idx: number) => {
                const subtotal = (item.unit === 'PIECE' ? item.quantity : item.weight) * item.unitPrice + item.processFee;
                return (
                  <div
                    key={item.categoryId}
                    className="rounded-[12px] border border-border bg-surface p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[16px] font-semibold text-text">{item.categoryName}</div>
                        <div className="text-[12px] text-text-3 mt-0.5">
                          单价 ¥{item.unitPrice.toFixed(2)}/斤
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center text-danger hover:bg-[#FEE2E2] transition"
                        aria-label="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-text-2 w-10">只数</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => update(idx, { quantity: Math.max(1, item.quantity - 1) })}
                          className="w-14 h-14 rounded-[10px] border border-border bg-surface text-text flex items-center justify-center hover:bg-[#F1F3EE] active:scale-95 transition"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-14 rounded-[10px] border border-border bg-bg flex items-center justify-center text-[20px] font-bold tnum">
                          {item.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => update(idx, { quantity: item.quantity + 1 })}
                          className="w-14 h-14 rounded-[10px] border border-primary bg-primary text-white flex items-center justify-center hover:bg-primary-600 active:scale-95 transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[12px] text-text-2">净重(斤)</span>
                        <Input
                          type="number"
                          step={0.1}
                          min={0.1}
                          inputMode="decimal"
                          value={item.weight}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            update(idx, { weight: Number(e.target.value) || 0 })
                          }
                          className="h-12 text-[15px] font-semibold tnum"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[12px] text-text-2">单价(元)</span>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          readOnly
                          className="h-12 text-[15px] font-semibold tnum bg-bg"
                        />
                      </label>
                    </div>

                    <div>
                      <div className="text-[12px] text-text-2 mb-1.5">加工方式</div>
                      <div className="flex flex-wrap gap-1.5">
                        {PROCESS_OPTIONS.map((p: ProcessMethod) => {
                          const active = item.processMethod === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => update(idx, { processMethod: p })}
                              className={cn(
                                'h-10 px-3 rounded-[8px] text-[13px] font-medium border transition active:scale-95',
                                active
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface text-text-2 border-border hover:border-primary hover:text-primary',
                              )}
                            >
                              {PROCESS_METHOD_LABEL[p]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-[12px] text-text-3">
                        {item.processFee > 0 && <>含加工费 ¥{item.processFee.toFixed(2)}</>}
                      </div>
                      <div className="text-[20px] font-bold text-primary tnum">
                        ¥{subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* RIGHT: Totals & Payment */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-[14px] font-semibold">结算</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-5">
            {/* Totals */}
            <div className="rounded-[12px] bg-gradient-to-br from-primary to-primary-600 text-white p-5 shadow-[var(--shadow-md)]">
              <div className="text-[12px] uppercase tracking-wider text-white/70">应收金额</div>
              <div className="mt-2 text-[44px] font-bold leading-none tnum">¥{payable.toFixed(2)}</div>
              <div className="mt-4 flex items-center justify-between text-[12px] text-white/85">
                <span>合计 ¥{total.toFixed(2)}</span>
                <span>优惠 ¥{discount.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <label className="text-[12px] text-text-2 font-medium">客户手机号（可选）</label>
              <Input
                placeholder="11 位手机号"
                value={phone}
                maxLength={11}
                inputMode="tel"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                className="h-12 text-[15px]"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <label className="text-[12px] text-text-2 font-medium">优惠（元）</label>
              <Input
                type="number"
                min={0}
                max={total}
                value={discount}
                inputMode="decimal"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = Number(e.target.value) || 0;
                  setDiscount(Math.min(Math.max(0, v), total));
                }}
                className="h-12 text-[15px] tnum"
              />
            </div>

            {/* Payment methods */}
            <div className="space-y-2">
              <label className="text-[12px] text-text-2 font-medium">支付方式</label>
              <div className="grid grid-cols-2 gap-2">
                {PAY_METHODS.map((p: PayMethod) => {
                  const active = payMethod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayMethod(p)}
                      className={cn(
                        'h-14 rounded-[10px] border text-[14px] font-semibold transition active:scale-95',
                        active
                          ? 'bg-primary text-white border-primary shadow-[var(--shadow-sm)]'
                          : 'bg-surface text-text border-border hover:border-primary hover:text-primary',
                      )}
                    >
                      {PAY_METHOD_LABEL[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="border-t border-border p-4 space-y-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full h-16 text-[18px] font-bold"
              onClick={submit}
              disabled={create.isPending || cart.length === 0}
            >
              <Printer className="w-5 h-5" />
              {create.isPending ? '出单中…' : `结算并出单  ¥${payable.toFixed(2)}`}
            </Button>
          </div>
        </Card>
      </div>

      {/* Member shortcut sheet */}
      <Sheet open={memberOpen} onOpenChange={setMemberOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>会员快捷查询</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <label className="text-[12px] text-text-2 font-medium">会员手机号</label>
            <Input
              placeholder="输入手机号"
              value={memberPhone}
              maxLength={11}
              inputMode="tel"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberPhone(e.target.value)}
              className="h-12 text-[15px]"
            />
            <div className="text-[12px] text-text-3">
              输入手机号后点击「使用此号码」可作为本单客户手机号录入。
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="ghost" size="lg">取消</Button>
            </SheetClose>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!memberPhone) {
                  toast.warning('请输入手机号');
                  return;
                }
                setPhone(memberPhone);
                setMemberOpen(false);
                toast.success('已应用会员手机号');
              }}
            >
              使用此号码
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
