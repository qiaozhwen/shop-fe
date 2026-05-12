import type { Rule } from 'antd/es/form';

export const phoneRule: Rule = {
  pattern: /^1[3-9]\d{9}$/,
  message: '手机号格式不正确',
};

export const required = (message = '必填'): Rule => ({
  required: true,
  message,
});
