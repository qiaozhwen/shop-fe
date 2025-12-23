import { request } from '@umijs/max';

// ==================== 通用类型 ====================
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
}

// ==================== 分类 API ====================
export interface Category {
  id: number;
  name: string;
  icon?: string;
  sort: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export const categoryApi = {
  getAll: () => request<Category[]>('/api/category'),
  getActive: () => request<Category[]>('/api/category/active'),
  getStatistics: () => request<any[]>('/api/category/statistics'),
  getById: (id: number) => request<Category>(`/api/category/${id}`),
  create: (data: Partial<Category>) => request<Category>('/api/category', { method: 'POST', data }),
  update: (id: number, data: Partial<Category>) => request<Category>(`/api/category/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/api/category/${id}`, { method: 'DELETE' }),
};

// ==================== 商品 API ====================
export interface Product {
  id: number;
  categoryId?: number;
  category?: Category;
  code?: string;
  name: string;
  unit: string;
  price: number;
  costPrice?: number;
  weightAvg?: number;
  imageUrl?: string;
  description?: string;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery extends PageQuery {
  categoryId?: number;
  keyword?: string;
  isActive?: boolean;
}

export const productApi = {
  getAll: (query?: ProductQuery) => request<PageResult<Product>>('/api/product', { params: query }),
  getActive: () => request<Product[]>('/api/product/active'),
  getLowStock: () => request<Product[]>('/api/product/low-stock'),
  getById: (id: number) => request<Product>(`/api/product/${id}`),
  create: (data: Partial<Product>) => request<Product>('/api/product', { method: 'POST', data }),
  update: (id: number, data: Partial<Product>) => request<Product>(`/api/product/${id}`, { method: 'PUT', data }),
  updateStatus: (id: number, isActive: boolean) => request<Product>(`/api/product/${id}/status`, { method: 'PUT', data: { isActive } }),
  delete: (id: number) => request(`/api/product/${id}`, { method: 'DELETE' }),
};

// ==================== 库存 API ====================
export interface Inventory {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  totalWeight: number;
  minQuantity: number;
  maxQuantity?: number;
  notes?: string;
  updatedAt: string;
}

export interface InventoryInbound {
  id: number;
  inboundNo: string;
  supplierId?: number;
  productId: number;
  product?: Product;
  quantity: number;
  weight?: number;
  unitPrice?: number;
  totalAmount?: number;
  batchNo?: string;
  type: string;
  remark?: string;
  operatorId: number;
  inboundAt: string;
}

export interface InventoryOutbound {
  id: number;
  outboundNo: string;
  type: string;
  orderId?: number;
  productId: number;
  product?: Product;
  quantity: number;
  weight?: number;
  reason?: string;
  operatorId: number;
  outboundAt: string;
}

export interface InventoryAlert {
  id: number;
  productId: number;
  product?: Product;
  currentStock: number;
  minStock: number;
  alertLevel: 'warning' | 'critical';
  handled: boolean;
  handledBy?: number;
  handledAt?: string;
  createdAt: string;
}

export const inventoryApi = {
  getAll: () => request<Inventory[]>('/api/inventory'),
  getOverview: () => request<any>('/api/inventory/overview'),
  getByProduct: (productId: number) => request<Inventory>(`/api/inventory/product/${productId}`),
  update: (productId: number, data: Partial<Inventory>) => request<Inventory>(`/api/inventory/product/${productId}`, { method: 'PUT', data }),
  
  // 入库
  getInbounds: (query?: any) => request<PageResult<InventoryInbound>>('/api/inventory/inbound', { params: query }),
  createInbound: (data: any) => request<InventoryInbound>('/api/inventory/inbound', { method: 'POST', data }),
  
  // 出库
  getOutbounds: (query?: any) => request<PageResult<InventoryOutbound>>('/api/inventory/outbound', { params: query }),
  createOutbound: (data: any) => request<InventoryOutbound>('/api/inventory/outbound', { method: 'POST', data }),
  
  // 预警
  getAlerts: (handled?: boolean) => request<InventoryAlert[]>('/api/inventory/alert', { params: { handled } }),
  handleAlert: (id: number) => request<InventoryAlert>(`/api/inventory/alert/${id}/handle`, { method: 'POST' }),
};

// ==================== 客户 API ====================
export interface Customer {
  id: number;
  name: string;
  type: 'restaurant' | 'retail' | 'wholesale' | 'personal';
  level: 'normal' | 'vip' | 'svip';
  contactName?: string;
  phone: string;
  address?: string;
  creditLimit: number;
  creditBalance: number;
  totalOrders: number;
  totalAmount: number;
  lastOrderAt?: string;
  remark?: string;
  status: boolean;
  createdAt: string;
}

export interface CustomerQuery extends PageQuery {
  keyword?: string;
  type?: string;
  level?: string;
  hasCredit?: boolean;
}

export const customerApi = {
  getAll: (query?: CustomerQuery) => request<PageResult<Customer>>('/api/customer', { params: query }),
  getById: (id: number) => request<Customer>(`/api/customer/${id}`),
  getAnalysis: () => request<any>('/api/customer/analysis'),
  getCreditLogs: (id: number) => request<any[]>(`/api/customer/${id}/credit-logs`),
  create: (data: Partial<Customer>) => request<Customer>('/api/customer', { method: 'POST', data }),
  update: (id: number, data: Partial<Customer>) => request<Customer>(`/api/customer/${id}`, { method: 'PUT', data }),
  repay: (id: number, amount: number, remark?: string) => request<Customer>(`/api/customer/${id}/repay`, { method: 'POST', data: { amount, remark } }),
  delete: (id: number) => request(`/api/customer/${id}`, { method: 'DELETE' }),
};

// ==================== 供应商 API ====================
export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  phone: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  supplyProducts?: string;
  totalPurchase: number;
  unpaidAmount: number;
  rating: number;
  remark?: string;
  status: boolean;
  createdAt: string;
}

export interface SupplierQuery extends PageQuery {
  keyword?: string;
}

export const supplierApi = {
  getAll: (query?: SupplierQuery) => request<PageResult<Supplier>>('/api/supplier', { params: query }),
  getActive: () => request<Supplier[]>('/api/supplier/active'),
  getById: (id: number) => request<Supplier>(`/api/supplier/${id}`),
  create: (data: Partial<Supplier>) => request<Supplier>('/api/supplier', { method: 'POST', data }),
  update: (id: number, data: Partial<Supplier>) => request<Supplier>(`/api/supplier/${id}`, { method: 'PUT', data }),
  pay: (id: number, amount: number) => request<Supplier>(`/api/supplier/${id}/pay`, { method: 'POST', data: { amount } }),
  delete: (id: number) => request(`/api/supplier/${id}`, { method: 'DELETE' }),
};

// ==================== 采购 API ====================
export interface PurchaseOrder {
  id: number;
  purchaseNo: string;
  supplierId: number;
  supplier?: Supplier;
  totalQuantity: number;
  totalWeight: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  expectedAt?: string;
  receivedAt?: string;
  remark?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  amount: number;
  receivedQuantity: number;
}

export interface PurchaseQuery extends PageQuery {
  supplierId?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export const purchaseApi = {
  getAll: (query?: PurchaseQuery) => request<PageResult<PurchaseOrder>>('/api/purchase', { params: query }),
  getById: (id: number) => request<PurchaseOrder>(`/api/purchase/${id}`),
  getStatistics: (startDate?: string, endDate?: string) => request<any>('/api/purchase/statistics', { params: { startDate, endDate } }),
  create: (data: any) => request<PurchaseOrder>('/api/purchase', { method: 'POST', data }),
  update: (id: number, data: any) => request<PurchaseOrder>(`/api/purchase/${id}`, { method: 'PUT', data }),
  confirm: (id: number) => request<PurchaseOrder>(`/api/purchase/${id}/confirm`, { method: 'POST' }),
  receive: (id: number, items: any[]) => request<PurchaseOrder>(`/api/purchase/${id}/receive`, { method: 'POST', data: { items } }),
  cancel: (id: number) => request<PurchaseOrder>(`/api/purchase/${id}/cancel`, { method: 'POST' }),
  pay: (id: number, amount: number) => request<PurchaseOrder>(`/api/purchase/${id}/pay`, { method: 'POST', data: { amount } }),
};

// ==================== 订单 API ====================
export interface Order {
  id: number;
  orderNo: string;
  customerId?: number;
  customer?: Customer;
  customerName?: string;
  totalQuantity: number;
  totalWeight: number;
  totalAmount: number;
  discountAmount: number;
  actualAmount: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'card' | 'credit';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  remark?: string;
  items: OrderItem[];
  orderAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  amount: number;
}

export interface OrderQuery extends PageQuery {
  customerId?: number;
  status?: string;
  paymentStatus?: string;
  orderNo?: string;
  startDate?: string;
  endDate?: string;
}

export const orderApi = {
  getAll: (query?: OrderQuery) => request<PageResult<Order>>('/api/order', { params: query }),
  getById: (id: number) => request<Order>(`/api/order/${id}`),
  getByOrderNo: (orderNo: string) => request<Order>(`/api/order/no/${orderNo}`),
  getStatistics: (startDate?: string, endDate?: string) => request<any>('/api/order/statistics', { params: { startDate, endDate } }),
  getTopProducts: (startDate?: string, endDate?: string, limit?: number) => request<any[]>('/api/order/top-products', { params: { startDate, endDate, limit } }),
  create: (data: any) => request<Order>('/api/order', { method: 'POST', data }),
  update: (id: number, data: any) => request<Order>(`/api/order/${id}`, { method: 'PUT', data }),
  pay: (id: number, data: { paymentMethod: string; amount: number; receivedAmount?: number }) => request<Order>(`/api/order/${id}/pay`, { method: 'POST', data }),
  cancel: (id: number) => request<Order>(`/api/order/${id}/cancel`, { method: 'POST' }),
};

// ==================== 财务 API ====================
export interface FinanceRecord {
  id: number;
  recordNo: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod?: string;
  relatedType?: string;
  relatedId?: number;
  description?: string;
  remark?: string;
  recordAt: string;
  createdAt: string;
}

export interface FinanceQuery extends PageQuery {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const financeApi = {
  getAll: (query?: FinanceQuery) => request<PageResult<FinanceRecord>>('/api/finance', { params: query }),
  getById: (id: number) => request<FinanceRecord>(`/api/finance/${id}`),
  getSummary: (startDate?: string, endDate?: string) => request<any>('/api/finance/summary', { params: { startDate, endDate } }),
  getSettlements: (startDate?: string, endDate?: string) => request<any[]>('/api/finance/settlements', { params: { startDate, endDate } }),
  create: (data: any) => request<FinanceRecord>('/api/finance', { method: 'POST', data }),
  settle: (date: string) => request<any>('/api/finance/settle', { method: 'POST', data: { date } }),
};

// ==================== 仪表盘 API ====================
export const dashboardApi = {
  getOverview: () => request<any>('/api/dashboard/overview'),
  getSalesTrend: (days?: number) => request<any[]>('/api/dashboard/sales-trend', { params: { days } }),
  getCategorySales: (startDate?: string, endDate?: string) => request<any[]>('/api/dashboard/category-sales', { params: { startDate, endDate } }),
  getRecentOrders: (limit?: number) => request<Order[]>('/api/dashboard/recent-orders', { params: { limit } }),
  getInventoryAlerts: () => request<InventoryAlert[]>('/api/dashboard/inventory-alerts'),
  getTopProducts: (limit?: number) => request<any[]>('/api/dashboard/top-products', { params: { limit } }),
  getWeeklySales: () => request<any[]>('/api/dashboard/weekly-sales'),
};

// ==================== 系统日志 API ====================
export interface SystemLog {
  id: number;
  staffId?: number;
  staffName?: string;
  module: string;
  action: string;
  content?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface LogQuery extends PageQuery {
  staffId?: number;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const systemLogApi = {
  getAll: (query?: LogQuery) => request<PageResult<SystemLog>>('/api/system-log', { params: query }),
  getStatistics: () => request<any>('/api/system-log/statistics'),
  clean: (days?: number) => request<number>('/api/system-log/clean', { method: 'POST', data: { days } }),
};

// ==================== 报表 API ====================
export interface ReportQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export const reportApi = {
  // 销售报表
  getSalesSummary: (query?: ReportQuery) => request<any>('/api/report/sales/summary', { params: query }),
  getSalesTrend: (query?: ReportQuery) => request<any[]>('/api/report/sales/trend', { params: query }),
  getCategorySales: (query?: ReportQuery) => request<any[]>('/api/report/sales/category', { params: query }),
  getProductRanking: (query?: ReportQuery) => request<any[]>('/api/report/sales/product-ranking', { params: query }),
  getHourlySales: (query?: ReportQuery) => request<any[]>('/api/report/sales/hourly', { params: query }),
  
  // 库存报表
  getInventorySummary: () => request<any>('/api/report/inventory/summary'),
  getInventoryTrend: (query?: ReportQuery) => request<any[]>('/api/report/inventory/trend', { params: query }),
  getCategoryInventory: () => request<any[]>('/api/report/inventory/category'),
  getTurnoverRanking: () => request<any[]>('/api/report/inventory/turnover'),
  getInventoryDetail: () => request<any[]>('/api/report/inventory/detail'),
};

// ==================== 员工 API ====================
export interface Staff {
  id: number;
  username: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'cashier' | 'warehouse';
  status: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export const staffApi = {
  getAll: () => request<Staff[]>('/api/employee'),
  getById: (id: number) => request<Staff>(`/api/employee/${id}`),
  create: (data: any) => request<Staff>('/api/employee', { method: 'POST', data }),
  update: (id: number, data: any) => request<Staff>(`/api/employee/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/api/employee/${id}`, { method: 'DELETE' }),
};

