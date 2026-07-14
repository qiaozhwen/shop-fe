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
requireMatch('deploy/nginx.conf', /^\s*proxy_pass http:\/\/shop-be:8080;$/m, 'proxy must preserve the /api prefix');
requireMatch('.github/workflows/deploy.yml', /docker network inspect shop-network[^\n]*\|\| docker network create shop-network/, 'deployment must create the shared Docker network');
requireMatch('.github/workflows/deploy.yml', /^\s*--network shop-network \\/m, 'frontend container must join the shared Docker network');
requireMatch('deploy/deploy.sh', /docker network inspect shop-network[^\n]*\|\| docker network create shop-network/, 'manual deployment must create the shared Docker network');
requireMatch('deploy/deploy.sh', /^\s*--network shop-network \\/m, 'manually deployed frontend must join the shared Docker network');

forbidMatch('src/pages/login/LoginPage.tsx', /演示|我已扫码|短信验证码|扫码登录|13800000000|MOCK_CODE/, 'demo, SMS, and SSO login UI must not ship');
forbidMatch('src/pages/account/SecurityPage.tsx', /SetFirstPasswordForm|BindList|sendSms|第三方登录|短信验证码/, 'unsupported SMS/SSO account controls must not ship');
forbidMatch('src/router/index.tsx', /BindPhonePage|SsoCallbackPage|ResetPasswordPage/, 'unsupported authentication routes must not ship');
forbidMatch('src/components/layout/Topbar.tsx', /待开发/, 'dead profile action must not ship');
forbidMatch('src/config/nav.ts', /settingsItem|path: '\/settings'/, 'undefined settings navigation must not ship');
forbidMatch('src/components/layout/Rail.tsx', /settingsItem|to=["']\/settings/, 'undefined settings navigation must not ship');
requireMatch('src/pages/staff/StaffPage.tsx', /name="password"/, 'staff creation must collect an initial login password');

if (failures.length) {
  console.error(`Production delivery configuration failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PRODUCTION_CONFIG_OK');
