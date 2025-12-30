import { login } from '@/services/auth';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

const { Title, Text, Paragraph } = Typography;

interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
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
      // 设置 token 过期时间（默认 24 小时）
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      sessionStorage.setItem('tokenExpiry', expiryTime.toString());
      message.success('登录成功，欢迎回来！');
      history.push('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* 左侧品牌区域 */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <img src="/logo.svg" alt="logo" className={styles.logoIcon} style={{ width: 48, height: 48 }} />
            <span className={styles.logoText}>禽翼鲜生</span>
          </div>
          <Title level={1} className={styles.brandTitle}>
            专业活禽<br />门店管理系统
          </Title>
          <Paragraph className={styles.brandDesc}>
            专为活禽贩卖门店打造的一站式管理解决方案<br />
            高效管理商品、库存、订单、客户、财务
          </Paragraph>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📦</div>
              <div className={styles.featureText}>
                <Text strong>智能库存</Text>
                <Text type="secondary">实时预警，自动补货提醒</Text>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureText}>
                <Text strong>数据分析</Text>
                <Text type="secondary">销售报表，经营洞察</Text>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>💰</div>
              <div className={styles.featureText}>
                <Text strong>财务管理</Text>
                <Text type="secondary">收支清晰，账目分明</Text>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.decoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          {/* 移动端 Logo */}
          <div className={styles.mobileLogo}>
            <img src="/logo.svg" alt="logo" className={styles.logoIconMobile} style={{ width: 40, height: 40 }} />
            <span className={styles.logoTextMobile}>禽翼鲜生</span>
          </div>
          
          <div className={styles.formHeader}>
            <Title level={2} className={styles.formTitle}>欢迎登录</Title>
            <Text type="secondary">请输入您的账号信息</Text>
          </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
            size="large"
            className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="用户名"
                className={styles.input}
              />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="密码"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a className={styles.forgotLink}>忘记密码？</a>
              </div>
          </Form.Item>

          <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className={styles.submitBtn}
              >
                登 录
            </Button>
          </Form.Item>
        </Form>

          <div className={styles.footer}>
            <Text type="secondary">
              © 2024 禽翼鲜生 门店管理系统 v1.0
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
