import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];

function requireMatch(path, pattern, message) {
  if (!pattern.test(read(path))) failures.push(`${path}: ${message}`);
}

function forbidMatch(path, pattern, message) {
  if (pattern.test(read(path))) failures.push(`${path}: ${message}`);
}

requireMatch('.env.production', /^VITE_USE_MOCK=false$/m, 'production mock mode must be disabled');
requireMatch('.env.production', /^VITE_API_BASE=\/$/m, 'production API base must be same-origin root');
requireMatch('.env.production', /^VITE_API_PREFIX=\/api$/m, 'production API prefix must be /api');
requireMatch('.env.production', /^VITE_AUTH_SMS=false$/m, 'SMS login must be disabled');
requireMatch('.env.production', /^VITE_AUTH_SSO=false$/m, 'SSO login must be disabled');

requireMatch('deploy/nginx.conf', /^\s*location \/api\/ \{/m, 'active /api/ reverse proxy is required');
requireMatch('deploy/nginx.conf', /^\s*resolver 127\.0\.0\.11 /m, 'Docker DNS must be resolved dynamically');
requireMatch('deploy/nginx.conf', /^\s*proxy_pass \$shop_backend;$/m, 'proxy must preserve the /api prefix through dynamic Docker DNS');
requireMatch('.github/workflows/deploy.yml', /docker network inspect shop-network[^\n]*\|\| docker network create shop-network/, 'deployment must create the shared Docker network');
requireMatch('.github/workflows/deploy.yml', /^\s*--network shop-network \\/m, 'frontend container must join the shared Docker network');
requireMatch('deploy/deploy.sh', /docker network inspect shop-network[^\n]*\|\| docker network create shop-network/, 'manual deployment must create the shared Docker network');
requireMatch('deploy/deploy.sh', /^\s*--network shop-network \\/m, 'manually deployed frontend must join the shared Docker network');
requireMatch('Dockerfile', /^HEALTHCHECK /m, 'frontend image must expose a container health check');
forbidMatch('deploy/README.md', /后续接入后端时/, 'handoff documentation must describe the active backend integration');

forbidMatch('src/pages/login/LoginPage.tsx', /演示|我已扫码|短信验证码|扫码登录|13800000000|MOCK_CODE/, 'demo, SMS, and SSO login UI must not ship');
forbidMatch('src/pages/account/SecurityPage.tsx', /SetFirstPasswordForm|BindList|sendSms|第三方登录|短信验证码/, 'unsupported SMS/SSO account controls must not ship');
requireMatch('src/pages/dashboard/DashboardPage.tsx', /useProcessingTasks\(\{ pageSize: 5, active: true \}\)/, 'dashboard processing queue must request active tasks from the backend');
requireMatch('src/pages/dashboard/DashboardPage.tsx', /const lowStockCount = data\.lowStockCount;/, 'dashboard low-stock KPI must use the complete backend summary');
forbidMatch('src/pages/dashboard/DashboardPage.tsx', /useSalesOrders\(\{ status: 'PROCESSING'/, 'dashboard must not infer processing tasks from order status');
forbidMatch('src/pages/dashboard/DashboardPage.tsx', /navigate\('\/(processing|members|reports|sales-orders)'\)/, 'dashboard actions must use registered application routes');
requireMatch('src/pages/supplier/SupplierPage.tsx', /LEVEL_TONE\[getValue<Supplier\['level'\]>\(\)\] \?\? LEVEL_TONE\.C/, 'supplier levels from older or external data must have a rendering fallback');
requireMatch('src/components/layout/Rail.tsx', /hidden md:flex/, 'primary desktop navigation rail must collapse on mobile');
requireMatch('src/components/layout/Secondary.tsx', /hidden lg:flex/, 'secondary desktop navigation must collapse below desktop width');
requireMatch('src/components/layout/Topbar.tsx', /aria-label="打开导航"/, 'mobile layout must retain access to every navigation module');
requireMatch('src/layouts/MainLayout.tsx', /px-3 py-4/, 'main content needs mobile-safe spacing');
forbidMatch('src/pages/stores/StoreDetailDrawer.tsx', /待 Sprint|后续接入/, 'store details must not ship placeholder modules');
for (const hook of ['useStaff', 'useInventory', 'useSalesOrders']) {
  requireMatch('src/pages/stores/StoreDetailDrawer.tsx', new RegExp(`${hook}\\(`), `store details must load related data through ${hook}`);
}
forbidMatch('src/router/index.tsx', /BindPhonePage|SsoCallbackPage|ResetPasswordPage/, 'unsupported authentication routes must not ship');
forbidMatch('src/components/layout/Topbar.tsx', /待开发/, 'dead profile action must not ship');
forbidMatch('src/config/nav.ts', /settingsItem|path: '\/settings'/, 'undefined settings navigation must not ship');
forbidMatch('src/components/layout/Rail.tsx', /settingsItem|to=["']\/settings/, 'undefined settings navigation must not ship');
requireMatch('src/pages/staff/StaffPage.tsx', /name="password"/, 'staff creation must collect an initial login password');
requireMatch('package.json', /"prebuild": "pnpm test:production-config"/, 'production checks must run automatically before every build');
forbidMatch('.dockerignore', /^\.github\/?$/m, 'Docker build context must include the workflow inspected by the production gate');
requireMatch('src/pages/pos/PosPage.tsx', /xl:grid-cols-\[1\.4fr_1\.3fr_1fr\]/, 'POS workspace must collapse to a single column on smaller screens');
forbidMatch('src/pages/pos/PosPage.tsx', /update\(idx, \{ unitPrice:/, 'POS unit prices must not be editable client-side');

if (failures.length) {
  console.error(`Production delivery configuration failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PRODUCTION_CONFIG_OK');
