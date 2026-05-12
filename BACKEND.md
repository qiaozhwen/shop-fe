# 活禽现杀销售门店管理系统 — 后端工作清单

> 配套前端项目：`shop-fe`（React 18 + TypeScript + Vite + Antd 6 + React Query + Zustand + React Router 7）
> 前端 Mock 实现位置：`src/api/mock.ts`，可直接对照接口契约。
> 切换真实后端：在 `.env.development` 设置 `VITE_USE_MOCK=false`，并配置 `VITE_API_BASE_URL`。

---

## 一、技术选型建议

| 维度 | 推荐 | 备选 | 说明 |
|---|---|---|---|
| 语言 / 框架 | Java 17 + Spring Boot 3 | Go (gin) / Node (NestJS) / Python (FastAPI) | 视团队栈而定 |
| 持久层 | MySQL 8.0 + MyBatis-Plus | PostgreSQL 14+ | 表结构含金额、重量字段使用 DECIMAL |
| 缓存 | Redis 7 | — | Token、热点价格、库存计数、限流 |
| 鉴权 | JWT (Access + Refresh) | Spring Security + OAuth2 | 前端持久化在 `useAuthStore` |
| 文件存储 | 阿里云 OSS / MinIO | 本地 FS | 商品/活禽/会员头像、票据图片 |
| 消息队列 | RocketMQ / Kafka | Redis Stream | 库存联动、报表生成、短信通知 |
| 定时任务 | XXL-Job / Quartz | — | 日报、周报、库存预警 |
| 日志监控 | ELK + Prometheus + Grafana | — | 业务监控大屏 |
| API 文档 | Swagger 3 (springdoc) | Apifox | 与前端联调 |
| 部署 | Docker + K8s / Docker Compose | — | 多门店多租户场景 |

---

## 二、统一约定

### 2.1 接口前缀
- 基础路径：`/api/v1`
- 鉴权：`Authorization: Bearer {token}`（登录、健康检查除外）
- 请求/响应：`application/json; charset=utf-8`

### 2.2 通用响应结构
```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```
- `code = 200` 成功；`401` 未登录；`403` 无权限；`400/500` 业务/系统错误
- 前端拦截器 `src/api/client.ts` 已按此结构解析

### 2.3 分页响应
```json
{ "list": [...], "total": 123 }
```
请求参数统一 `page`（从 1 开始）、`pageSize`、`keyword`、业务过滤字段。

### 2.4 多门店上下文
- 大部分业务对象都带 `storeId`
- 前端通过查询参数 `storeId` 传递；后端结合用户角色做数据权限过滤
  - `ADMIN` / 总部：可查所有门店
  - 店长：可查授权门店
  - 收银/屠宰师傅：默认仅本店

### 2.5 软删除
- 所有主数据表（门店、品类、会员、员工、供应商等）建议带 `deleted` Tinyint(0/1)
- 业务流水表（订单、加工、损耗）保留物理记录，不删除，仅状态变更

---

## 三、数据库设计（核心表概览）

> 以下为主要实体；命名建议蛇形小写，ID 默认 BIGINT 自增（或 Snowflake ULID）。

### 3.1 系统/账号
| 表 | 关键字段 | 说明 |
|---|---|---|
| `sys_user` | id, username, password_hash, nickname, role, store_id, avatar, status, created_at | 后台用户 |
| `sys_role` | id, code, name, description | 角色：ADMIN/MANAGER/CASHIER/BUTCHER/HELPER |
| `sys_permission` | id, code, name, parent_id | 菜单+按钮权限（可选） |
| `sys_user_role` | user_id, role_id | 用户角色绑定 |
| `sys_login_log` | id, user_id, ip, user_agent, created_at | 登录审计 |

### 3.2 门店
| 表 | 关键字段 |
|---|---|
| `store` | id, code, name, address, phone, manager, business_hours, status(OPEN/CLOSED/RENOVATING), lat, lng, created_at |
| `store_setting` | store_id, key, value | 门店级配置（如默认加工费比例） |

### 3.3 活禽品类与库存
| 表 | 关键字段 |
|---|---|
| `poultry_category` | id, code, name, breed, unit(只/斤), avg_weight, processing_fee, status |
| `poultry_inventory` | id, store_id, category_id, batch_no, quantity, in_date, source_supplier_id, unit_cost, health_status(HEALTHY/SICK/QUARANTINE), notes |
| `poultry_inventory_log` | id, inventory_id, change_qty, type(IN/OUT/ADJUST/LOSS), ref_type, ref_id, operator_id, created_at | 库存变动流水 |

### 3.4 销售订单
| 表 | 关键字段 |
|---|---|
| `sales_order` | id, order_no, store_id, member_id, cashier_id, total_amount, paid_amount, change_amount, payment_method(CASH/WECHAT/ALIPAY/CARD/MEMBER_BALANCE), status(PENDING/PAID/COMPLETED/CANCELED), remark, created_at |
| `sales_order_item` | id, order_id, category_id, inventory_id, quantity, weight_kg, unit_price, processing_method(LIVE/SLAUGHTER/CLEAN/CHOP/HEAD_FEET/VACUUM), processing_fee, subtotal |

### 3.5 加工任务
| 表 | 关键字段 |
|---|---|
| `processing_task` | id, task_no, order_id, order_item_id, store_id, category_id, quantity, processing_method, status(PENDING/SLAUGHTER/DEFEATHER/EVISCERATE/PACK/DELIVERED/CANCELED), assigned_to, started_at, finished_at, notes |
| `processing_task_log` | id, task_id, from_status, to_status, operator_id, created_at | 流转日志 |

### 3.6 采购 / 供应商
| 表 | 关键字段 |
|---|---|
| `supplier` | id, name, contact, phone, address, license_no, status |
| `purchase_order` | id, po_no, supplier_id, store_id, total_amount, status(DRAFT/CONFIRMED/RECEIVED/CANCELED), expected_date, received_date, notes |
| `purchase_order_item` | id, po_id, category_id, quantity, unit_price, subtotal |

### 3.7 损耗
| 表 | 关键字段 |
|---|---|
| `loss_record` | id, store_id, category_id, inventory_id, quantity, reason(DEAD/SICK/INJURED/ESCAPED), disposal(HARMLESS/INCINERATE/BURY), operator_id, photos, notes, created_at |

### 3.8 会员
| 表 | 关键字段 |
|---|---|
| `member` | id, card_no, name, phone, gender, birthday, level(REGULAR/SILVER/GOLD/PLATINUM), points, balance, total_consumption, last_visit_at, store_id, created_at |
| `member_transaction` | id, member_id, type(RECHARGE/CONSUME/REFUND/POINT_REDEEM), amount, points_delta, ref_order_id, created_at |

### 3.9 员工
| 表 | 关键字段 |
|---|---|
| `staff` | id, name, phone, role(MANAGER/CASHIER/BUTCHER/HELPER), store_id, hire_date, status(ON_DUTY/LEAVE/RESIGNED), id_card, address |
| `staff_schedule` | id, staff_id, work_date, shift, status | 排班（可选） |

### 3.10 价格
| 表 | 关键字段 |
|---|---|
| `pricing` | id, store_id, category_id, base_price, processing_fee, promo_price, effective_from, effective_to, updated_by, updated_at | 唯一约束 (store_id, category_id, effective_from) |

### 3.11 报表 / 统计（可使用物化或定时聚合）
| 表 | 关键字段 |
|---|---|
| `report_daily_sales` | id, store_id, date, order_count, total_amount, member_count, paid_amount | 每日聚合 |
| `report_daily_inventory` | id, store_id, category_id, date, opening_qty, in_qty, out_qty, loss_qty, closing_qty |

---

## 四、接口清单（按模块）

> 全部接口前缀 `/api/v1`，以下省略前缀。
> 列表接口默认返回 `{ list, total }`，分页参数：`page`, `pageSize`。

### 4.1 鉴权
| 方法 | 路径 | 说明 | 备注 |
|---|---|---|---|
| POST | `/auth/login` | 用户名密码登录 | body: `{username, password}` → `{token, user}` |
| POST | `/auth/logout` | 登出 | 服务端将 token 加入黑名单 |
| GET  | `/auth/me` | 当前登录用户信息 | 用于刷新 |
| POST | `/auth/refresh` | 刷新 token | （可选） |
| POST | `/auth/change-password` | 修改密码 | |

### 4.2 门店管理
| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/stores` | 门店列表（支持 keyword, status） |
| POST | `/stores` | 新增 |
| PUT  | `/stores/:id` | 修改 |
| DELETE | `/stores/:id` | 删除（软删） |
| GET  | `/stores/:id` | 详情 |

### 4.3 活禽品类
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / PUT / DELETE | `/poultry-categories[/:id]` | CRUD |

### 4.4 活禽库存
| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/inventory` | 列表（支持 storeId, categoryId, healthStatus） |
| POST | `/inventory` | 新增入栏 |
| PUT  | `/inventory/:id` | 修改 |
| POST | `/inventory/:id/adjust` | 数量调整（body: `{delta, reason}`） |
| DELETE | `/inventory/:id` | 删除（仅库存为 0 时允许） |
| GET  | `/inventory/:id/logs` | 变动流水 |

### 4.5 销售订单（POS）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/sales-orders` | **核心**：下单。事务内：扣库存 → 落订单 → 生成加工任务 → 会员积分/余额变动 |
| GET  | `/sales-orders` | 列表（storeId, status, dateFrom, dateTo, memberId） |
| GET  | `/sales-orders/:id` | 详情（含 items） |
| POST | `/sales-orders/:id/pay` | 标记收款（如非现场支付） |
| POST | `/sales-orders/:id/cancel` | 取消（恢复库存、级联取消加工任务） |
| POST | `/sales-orders/:id/refund` | 退款（可选） |
| GET  | `/sales-orders/:id/print` | 获取小票打印数据 |

### 4.6 加工任务（看板）
| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/processing-tasks` | 列表（storeId, status） |
| GET  | `/processing-tasks/:id` | 详情 |
| POST | `/processing-tasks/:id/advance` | 推进到下一阶段（按 PROCESSING_FLOW） |
| POST | `/processing-tasks/:id/assign` | 指派屠宰工 |
| POST | `/processing-tasks/:id/cancel` | 取消任务 |

### 4.7 采购
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / PUT / DELETE | `/purchases[/:id]` | 采购单 CRUD |
| POST | `/purchases/:id/receive` | 确认入库（自动写库存） |
| POST | `/purchases/:id/cancel` | 取消 |

### 4.8 供应商
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / PUT / DELETE | `/suppliers[/:id]` | CRUD |

### 4.9 损耗
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / DELETE | `/losses[/:id]` | 登记 / 查询。新增时自动减库存 |

### 4.10 会员
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / PUT / DELETE | `/members[/:id]` | CRUD |
| POST | `/members/:id/recharge` | 充值（写流水） |
| GET  | `/members/:id/transactions` | 交易明细 |
| GET  | `/members/lookup?phone=xxx` | 收银台快查 |

### 4.11 员工
| 方法 | 路径 | 说明 |
|---|---|---|
| GET / POST / PUT / DELETE | `/staff[/:id]` | CRUD |

### 4.12 价格
| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/pricing` | 当前生效价（storeId） |
| PUT  | `/pricing/:id` | 更新单价/加工费/促销价 |
| POST | `/pricing/batch-update` | 批量调价 |
| GET  | `/pricing/history` | 价格历史（可选） |

### 4.13 报表 / 工作台
| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/dashboard/summary` | 工作台首页汇总：今日销售、订单、库存、损耗、加工待处理、会员/门店/员工总数、近 7 日趋势、品类排行、门店存栏 |
| GET  | `/reports/sales` | 销售报表（dateFrom, dateTo, storeId, groupBy=day/week/month） |
| GET  | `/reports/inventory` | 库存报表 |
| GET  | `/reports/loss` | 损耗报表 |
| GET  | `/reports/profit` | 毛利分析（可选） |
| POST | `/reports/export` | 导出 Excel/PDF |

### 4.14 文件上传
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/files/upload` | 通用上传（图片、票据） |
| POST | `/files/sign` | OSS 直传签名（可选） |

---

## 五、关键业务规则与事务

### 5.1 下单事务（POS）
单事务内必须保证：
1. 校验库存：`inventory.quantity >= sum(item.quantity)`
2. 计算金额：`subtotal = price * weight + processing_fee`，订单总额 = sum(subtotal) - 优惠
3. 扣减库存（行锁 `SELECT ... FOR UPDATE`，避免超卖）
4. 写订单 + 订单明细
5. 为每个明细生成 `processing_task`（status = PENDING）
6. 若使用会员余额支付：扣余额；若产生积分：加积分
7. 写库存变动流水、会员交易流水

### 5.2 库存联动场景
| 触发动作 | 库存变化 |
|---|---|
| 采购确认入库 | +新增 inventory 行 |
| 销售下单 | -扣减 |
| 订单取消 | +恢复 |
| 损耗登记 | -扣减 |
| 手动盘点 | 调整为目标值，写流水 |

### 5.3 加工流转
- 状态机：`PENDING → SLAUGHTER → DEFEATHER → EVISCERATE → PACK → DELIVERED`
- 任意阶段可 `CANCEL`（但需校验订单是否已完成）
- 每次推进写 `processing_task_log`

### 5.4 会员权益
- 等级与累计消费挂钩，定时任务每日凌晨重算
- 积分规则：消费 ¥1 = 1 积分（可配置）
- 余额支付需校验 `balance >= amount`

### 5.5 数据权限
- 所有"列表/统计"接口必须根据当前用户的 `role` + `storeId` 过滤
- 总部统计接口需聚合所有门店

---

## 六、非功能性需求

### 6.1 安全
- 密码 BCrypt 加盐
- JWT 过期时间：Access 2h，Refresh 7d
- 接口限流：登录 / 短信 接口需 IP 级限流（Redis + Lua）
- 防 SQL 注入（参数化查询）、防 XSS（响应转义）
- 操作日志（关键变更：删除、退款、调价）

### 6.2 性能
- 库存表 (store_id, category_id) 联合索引
- 订单表按月分表或分区（数据量大时）
- 工作台 `/dashboard/summary` 聚合结果缓存 5 分钟
- 报表使用预聚合表 + 异步生成

### 6.3 可观测性
- 统一异常处理 + 错误码体系
- 关键链路（下单、加工流转）打 Trace ID，接入 SkyWalking / Jaeger
- 业务指标：日订单量、库存周转、损耗率上 Grafana

### 6.4 多租户（可选）
- 若计划做 SaaS：所有表加 `tenant_id`，DAO 层 / MyBatis 拦截器自动注入

---

## 七、推荐研发顺序（迭代节奏）

| Sprint | 范围 | 交付 |
|---|---|---|
| **S1** | 基础框架 + 鉴权 + 用户/门店/角色 | 登录、门店切换 |
| **S2** | 品类 + 库存 + 采购 + 供应商 | 库存可入可出，闭环 |
| **S3** | POS 下单 + 加工任务 + 价格 | 核心业务跑通 |
| **S4** | 会员 + 损耗 + 员工 | 完善业务模块 |
| **S5** | 工作台 + 报表 + 导出 | 数据可视化 |
| **S6** | 监控 + 性能优化 + 多端适配 | 上线准备 |

---

## 八、与前端联调 Checklist

- [ ] 后端启动后，前端 `.env.development` 设置 `VITE_USE_MOCK=false` + `VITE_API_BASE_URL=http://localhost:8080/api/v1`
- [ ] CORS：开发环境允许 `http://localhost:5173`
- [ ] 所有响应严格遵守 `{ code, message, data }`
- [ ] 列表接口严格遵守 `{ list, total }`
- [ ] 字段命名与 `src/types/*.ts` 保持一致（驼峰），或通过 Jackson `@JsonNaming` 转换
- [ ] 枚举值采用大写英文（如 `PENDING`、`PAID`），与前端 `*_STATUS` 常量对齐
- [ ] 时间字段统一 ISO8601 字符串（`2026-05-08T09:00:00+08:00`）
- [ ] 金额、重量字段使用字符串或 Number（避免精度丢失）；前端会用 `toFixed(2)` 显示
- [ ] 上传接口返回 `{ url }` 即可

---

**文档维护**：每次接口或字段变更，请同步更新本文件 + `src/types/*.ts` + `src/api/mock.ts`，确保三方一致。
