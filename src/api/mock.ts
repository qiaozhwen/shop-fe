import type { AxiosRequestConfig } from 'axios';
import {
  sleep,
  ok,
  nextId,
  stores,
  categories,
  inventory,
  orders,
  processingTasks,
  suppliers,
  purchases,
  losses,
  members,
  staff,
  pricing,
  adminUser,
} from './mockData';
import type { Store, StoreCreateDTO } from '@/types/store';
import type { PoultryCategory } from '@/types/poultry';
import type { InventoryItem } from '@/types/inventory';
import type { SalesOrder, SalesOrderCreateDTO } from '@/types/order';
import { PROCESSING_FLOW } from '@/types/processing';
import type { Supplier, PurchaseOrder, LossRecord } from '@/types/biz';
import type {
  Member,
  Staff,
  PricingItem,
  LoginDTO,
  LoginResult,
} from '@/types/people';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface MockHandler {
  match: RegExp;
  method: Method | Method[];
  handle: (m: RegExpMatchArray, body: any, params: any) => any | Promise<any>;
}

const filterByKeyword = <T extends Record<string, any>>(
  arr: T[],
  kw?: string,
  fields: string[] = ['name'],
) => {
  if (!kw) return arr;
  const k = String(kw).toLowerCase();
  return arr.filter((x) =>
    fields.some((f) =>
      String(x[f] ?? '')
        .toLowerCase()
        .includes(k),
    ),
  );
};

const paginate = <T>(arr: T[], page = 1, pageSize = 10) => ({
  list: arr.slice((page - 1) * pageSize, page * pageSize),
  total: arr.length,
});

const handlers: MockHandler[] = [
  // ---- 登录 ----
  {
    match: /^\/auth\/login$/,
    method: 'post',
    handle: (_m, body: LoginDTO) => {
      if (body.username === 'admin' && body.password === '123456') {
        return ok<LoginResult>({
          token: 'mock-token-' + Date.now(),
          user: adminUser,
        });
      }
      return { code: 401, message: '用户名或密码错误', data: null };
    },
  },
  {
    match: /^\/auth\/me$/,
    method: 'get',
    handle: () => ok(adminUser),
  },

  // ---- 工作台 ----
  {
    match: /^\/dashboard\/summary$/,
    method: 'get',
    handle: () =>
      ok({
        todaySales: orders
          .filter((o) => o.status !== 'CANCELED' && o.status !== 'REFUNDED')
          .reduce((s, o) => s + o.payable, 0),
        todayOrders: orders.length,
        poultryStock: inventory.reduce((s, i) => s + i.quantity, 0),
        todayLoss: losses.reduce((s, l) => s + l.quantity, 0),
        processingPending: processingTasks.filter(
          (t) => t.status !== 'DELIVERED' && t.status !== 'CANCELED',
        ).length,
        memberCount: members.length,
        storeCount: stores.length,
        staffCount: staff.length,
        salesTrend: Array.from({ length: 7 }).map((_, i) => ({
          date: `${i + 2}日`,
          sales: Math.round(800 + Math.random() * 1500),
          orders: Math.round(20 + Math.random() * 40),
        })),
        categoryRanking: categories.slice(0, 5).map((c) => ({
          name: c.name,
          sales: Math.round(500 + Math.random() * 2000),
        })),
        stockByStore: stores.map((s) => ({
          store: s.name,
          quantity: inventory
            .filter((i) => i.storeId === s.id)
            .reduce((sum, i) => sum + i.quantity, 0),
        })),
      }),
  },

  // ---- 门店 ----
  {
    match: /^\/stores$/,
    method: 'get',
    handle: (_m, _b, params) => {
      let list = filterByKeyword(stores, params?.keyword, [
        'name',
        'code',
        'address',
        'ownerName',
      ]);
      if (params?.status) list = list.filter((s) => s.status === params.status);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/stores$/,
    method: 'post',
    handle: (_m, body: StoreCreateDTO) => {
      const item: Store = { id: nextId(), status: 'OPEN', ...body } as Store;
      stores.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/stores\/(\d+)$/,
    method: 'get',
    handle: (m) => {
      const id = +m[1];
      const item = stores.find((s) => s.id === id);
      return item ? ok(item) : { code: 404, message: '门店不存在', data: null };
    },
  },
  {
    match: /^\/stores\/(\d+)$/,
    method: 'put',
    handle: (m, body) => {
      const id = +m[1];
      const idx = stores.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '门店不存在', data: null };
      stores[idx] = { ...stores[idx], ...body };
      return ok(stores[idx]);
    },
  },
  {
    match: /^\/stores\/(\d+)$/,
    method: 'delete',
    handle: (m) => {
      const id = +m[1];
      const idx = stores.findIndex((s) => s.id === id);
      if (idx >= 0) stores.splice(idx, 1);
      return ok(null);
    },
  },

  // ---- 品类 ----
  {
    match: /^\/poultry-categories$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(categories, params?.keyword, [
        'name',
        'code',
        'species',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/poultry-categories$/,
    method: 'post',
    handle: (_m, body: PoultryCategory) => {
      const item = { ...body, id: nextId() };
      categories.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/poultry-categories\/(\d+)$/,
    method: 'put',
    handle: (m, body) => {
      const id = +m[1];
      const idx = categories.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '不存在', data: null };
      categories[idx] = { ...categories[idx], ...body };
      return ok(categories[idx]);
    },
  },
  {
    match: /^\/poultry-categories\/(\d+)$/,
    method: 'delete',
    handle: (m) => {
      const id = +m[1];
      const idx = categories.findIndex((s) => s.id === id);
      if (idx >= 0) categories.splice(idx, 1);
      return ok(null);
    },
  },

  // ---- 库存 ----
  {
    match: /^\/inventory$/,
    method: 'get',
    handle: (_m, _b, params) => {
      let list = inventory.slice();
      if (params?.storeId)
        list = list.filter((x) => x.storeId === +params.storeId);
      if (params?.categoryId)
        list = list.filter((x) => x.categoryId === +params.categoryId);
      list = filterByKeyword(list, params?.keyword, [
        'categoryName',
        'storeName',
        'batchNo',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/inventory$/,
    method: 'post',
    handle: (_m, body: InventoryItem) => {
      const item = {
        ...body,
        id: nextId(),
        totalWeight: body.quantity * body.avgWeight,
      };
      inventory.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/inventory\/(\d+)\/adjust$/,
    method: 'post',
    handle: (m, body: { delta: number; reason: string }) => {
      const id = +m[1];
      const item = inventory.find((x) => x.id === id);
      if (!item) return { code: 404, message: '库存不存在', data: null };
      item.quantity = Math.max(0, item.quantity + body.delta);
      item.totalWeight = +(item.quantity * item.avgWeight).toFixed(2);
      return ok(item);
    },
  },
  {
    match: /^\/inventory\/(\d+)$/,
    method: 'delete',
    handle: (m) => {
      const id = +m[1];
      const idx = inventory.findIndex((s) => s.id === id);
      if (idx >= 0) inventory.splice(idx, 1);
      return ok(null);
    },
  },

  // ---- 销售订单 ----
  {
    match: /^\/sales-orders$/,
    method: 'get',
    handle: (_m, _b, params) => {
      let list = orders.slice();
      if (params?.status) list = list.filter((x) => x.status === params.status);
      if (params?.storeId)
        list = list.filter((x) => x.storeId === +params.storeId);
      list = filterByKeyword(list, params?.keyword, [
        'orderNo',
        'storeName',
        'customerPhone',
      ]);
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/sales-orders\/(\d+)$/,
    method: 'get',
    handle: (m) => {
      const id = +m[1];
      const item = orders.find((s) => s.id === id);
      return item ? ok(item) : { code: 404, message: '订单不存在', data: null };
    },
  },
  {
    match: /^\/sales-orders$/,
    method: 'post',
    handle: (_m, body: SalesOrderCreateDTO) => {
      const total = body.items.reduce((s, i) => s + i.subtotal, 0);
      const discount = body.discount ?? 0;
      const store = stores.find((s) => s.id === body.storeId);
      const order: SalesOrder = {
        id: nextId(),
        orderNo: 'SO' + Date.now(),
        storeId: body.storeId,
        storeName: store?.name ?? '',
        items: body.items.map((i) => ({ ...i, id: nextId() })),
        totalAmount: total,
        discount,
        payable: total - discount,
        payMethod: body.payMethod,
        memberId: body.memberId,
        customerPhone: body.customerPhone,
        status: body.payMethod ? 'PAID' : 'PENDING',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        paidAt: body.payMethod
          ? new Date().toISOString().slice(0, 19).replace('T', ' ')
          : undefined,
        remark: body.remark,
      };
      orders.unshift(order);
      // 自动生成加工任务
      body.items.forEach((it) => {
        if (it.processMethod !== 'ALIVE') {
          processingTasks.unshift({
            id: nextId(),
            taskNo: 'PT' + Date.now() + Math.floor(Math.random() * 100),
            orderNo: order.orderNo,
            storeName: order.storeName,
            categoryName: it.categoryName,
            quantity: it.quantity,
            weight: it.weight,
            methods: [it.processMethod],
            status: 'WAIT_SLAUGHTER',
            priority: 'NORMAL',
            createdAt: order.createdAt,
          });
        }
      });
      return ok(order);
    },
  },
  {
    match: /^\/sales-orders\/(\d+)\/status$/,
    method: 'put',
    handle: (m, body: { status: SalesOrder['status'] }) => {
      const id = +m[1];
      const item = orders.find((s) => s.id === id);
      if (!item) return { code: 404, message: '订单不存在', data: null };
      item.status = body.status;
      if (body.status === 'COMPLETED')
        item.completedAt = new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
      return ok(item);
    },
  },

  // ---- 加工任务 ----
  {
    match: /^\/processing-tasks$/,
    method: 'get',
    handle: (_m, _b, params) => {
      let list = processingTasks.slice();
      if (params?.status) list = list.filter((x) => x.status === params.status);
      list = filterByKeyword(list, params?.keyword, [
        'taskNo',
        'orderNo',
        'workerName',
        'categoryName',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize ?? 50));
    },
  },
  {
    match: /^\/processing-tasks\/(\d+)\/advance$/,
    method: 'post',
    handle: (m) => {
      const id = +m[1];
      const item = processingTasks.find((s) => s.id === id);
      if (!item) return { code: 404, message: '任务不存在', data: null };
      const idx = PROCESSING_FLOW.indexOf(item.status as any);
      if (idx >= 0 && idx < PROCESSING_FLOW.length - 1) {
        item.status = PROCESSING_FLOW[idx + 1];
        if (item.status === 'DELIVERED')
          item.finishedAt = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        else if (!item.startedAt)
          item.startedAt = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
      }
      return ok(item);
    },
  },
  {
    match: /^\/processing-tasks\/(\d+)\/assign$/,
    method: 'post',
    handle: (m, body: { workerId: number; workerName: string }) => {
      const id = +m[1];
      const item = processingTasks.find((s) => s.id === id);
      if (!item) return { code: 404, message: '任务不存在', data: null };
      item.workerId = body.workerId;
      item.workerName = body.workerName;
      return ok(item);
    },
  },

  // ---- 供应商 ----
  {
    match: /^\/suppliers$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(suppliers, params?.keyword, [
        'name',
        'contact',
        'phone',
        'category',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/suppliers$/,
    method: 'post',
    handle: (_m, body: Supplier) => {
      const item = { ...body, id: nextId() };
      suppliers.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/suppliers\/(\d+)$/,
    method: 'put',
    handle: (m, body) => {
      const id = +m[1];
      const idx = suppliers.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '不存在', data: null };
      suppliers[idx] = { ...suppliers[idx], ...body };
      return ok(suppliers[idx]);
    },
  },
  {
    match: /^\/suppliers\/(\d+)$/,
    method: 'delete',
    handle: (m) => {
      const id = +m[1];
      const idx = suppliers.findIndex((s) => s.id === id);
      if (idx >= 0) suppliers.splice(idx, 1);
      return ok(null);
    },
  },

  // ---- 采购 ----
  {
    match: /^\/purchases$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(purchases, params?.keyword, [
        'orderNo',
        'supplierName',
        'storeName',
        'categoryName',
        'batchNo',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/purchases$/,
    method: 'post',
    handle: (_m, body: PurchaseOrder) => {
      const item = {
        ...body,
        id: nextId(),
        orderNo: 'PO' + Date.now(),
        amount: body.unitPrice * body.totalWeight,
        status: 'SUBMITTED' as const,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      purchases.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/purchases\/(\d+)\/receive$/,
    method: 'post',
    handle: (m) => {
      const id = +m[1];
      const item = purchases.find((s) => s.id === id);
      if (!item) return { code: 404, message: '采购单不存在', data: null };
      item.status = 'RECEIVED';
      item.receivedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      // 同时入栏
      const cat = categories.find((c) => c.name === item.categoryName);
      inventory.unshift({
        id: nextId(),
        storeId: item.storeId,
        storeName: item.storeName,
        categoryId: cat?.id ?? 0,
        categoryName: item.categoryName,
        batchNo: item.batchNo,
        quantity: item.quantity,
        avgWeight: +(item.totalWeight / item.quantity).toFixed(2),
        totalWeight: item.totalWeight,
        health: 'HEALTHY',
        inStockAt: item.receivedAt!,
        supplierName: item.supplierName,
      });
      return ok(item);
    },
  },

  // ---- 损耗 ----
  {
    match: /^\/losses$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(losses, params?.keyword, [
        'storeName',
        'categoryName',
        'handler',
        'batchNo',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/losses$/,
    method: 'post',
    handle: (_m, body: LossRecord) => {
      const item = { ...body, id: nextId() };
      losses.unshift(item);
      return ok(item);
    },
  },

  // ---- 会员 ----
  {
    match: /^\/members$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(members, params?.keyword, [
        'name',
        'phone',
        'cardNo',
      ]);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/members$/,
    method: 'post',
    handle: (_m, body: Member) => {
      const item = {
        ...body,
        id: nextId(),
        points: 0,
        balance: 0,
        totalConsumption: 0,
        registeredAt: new Date().toISOString().slice(0, 10),
      };
      members.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/members\/(\d+)$/,
    method: 'put',
    handle: (m, body) => {
      const id = +m[1];
      const idx = members.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '不存在', data: null };
      members[idx] = { ...members[idx], ...body };
      return ok(members[idx]);
    },
  },

  // ---- 员工 ----
  {
    match: /^\/staff$/,
    method: 'get',
    handle: (_m, _b, params) => {
      let list = staff.slice();
      if (params?.role) list = list.filter((x) => x.role === params.role);
      if (params?.storeId)
        list = list.filter((x) => x.storeId === +params.storeId);
      list = filterByKeyword(list, params?.keyword, ['name', 'phone']);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/staff$/,
    method: 'post',
    handle: (_m, body: Staff) => {
      const item = { ...body, id: nextId() };
      staff.unshift(item);
      return ok(item);
    },
  },
  {
    match: /^\/staff\/(\d+)$/,
    method: 'put',
    handle: (m, body) => {
      const id = +m[1];
      const idx = staff.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '不存在', data: null };
      staff[idx] = { ...staff[idx], ...body };
      return ok(staff[idx]);
    },
  },
  {
    match: /^\/staff\/(\d+)$/,
    method: 'delete',
    handle: (m) => {
      const id = +m[1];
      const idx = staff.findIndex((s) => s.id === id);
      if (idx >= 0) staff.splice(idx, 1);
      return ok(null);
    },
  },

  // ---- 价格 ----
  {
    match: /^\/pricing$/,
    method: 'get',
    handle: (_m, _b, params) => {
      const list = filterByKeyword(pricing, params?.keyword, ['categoryName']);
      return ok(paginate(list, params?.page, params?.pageSize));
    },
  },
  {
    match: /^\/pricing\/(\d+)$/,
    method: 'put',
    handle: (m, body: Partial<PricingItem>) => {
      const id = +m[1];
      const idx = pricing.findIndex((s) => s.id === id);
      if (idx < 0) return { code: 404, message: '不存在', data: null };
      pricing[idx] = { ...pricing[idx], ...body };
      return ok(pricing[idx]);
    },
  },
];

export async function mockAdapter(config: AxiosRequestConfig) {
  await sleep(150 + Math.random() * 200);
  const method = (config.method ?? 'get').toLowerCase() as Method;
  const url = config.url ?? '';
  const body =
    typeof config.data === 'string' ? safeJSON(config.data) : config.data;
  const params = config.params;

  for (const h of handlers) {
    const methods = Array.isArray(h.method) ? h.method : [h.method];
    if (!methods.includes(method)) continue;
    const m = url.match(h.match);
    if (m) {
      const data = await h.handle(m, body, params);
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
  }

  return {
    data: {
      code: 404,
      message: `Mock 未实现：${method.toUpperCase()} ${url}`,
      data: null,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}

function safeJSON(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
