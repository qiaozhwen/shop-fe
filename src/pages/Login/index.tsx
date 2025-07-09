import { login } from '@/services/auth';
import { Button, Form, Input, Layout, message } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response: any = await login(values);
      sessionStorage.setItem('token', response.access_token);
      sessionStorage.setItem('username', JSON.stringify(response.user));
      message.success('登录成功');
      history.push('/');
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={styles.container}>
      <div className={styles.loginForm}>
        <h2>登录</h2>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default LoginPage;
