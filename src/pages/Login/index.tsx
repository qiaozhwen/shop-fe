import { Button, Form, Input, Layout, message } from 'antd';
import { history } from 'umi';
import styles from './index.less';

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginForm) => {
    try {
      // TODO: 替换为实际的登录API调用
      const mockResponse = { token: 'mock-token' };
      sessionStorage.setItem('token', mockResponse.token);
      message.success('登录成功');
      history.push('/');
    } catch (error) {
      message.error('登录失败，请重试');
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
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default LoginPage;
