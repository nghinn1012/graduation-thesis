import { Card, Form, Input, Typography, Button, Flex } from "antd";
import { FunctionComponent } from "react";
import registerImage from "../assets/register.webp"
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
interface RegisterProps {}

const Login: FunctionComponent<RegisterProps> = () => {
    const { loading, error, loginUser } = useLogin();

    const handleLogin = (values: any) => {
      loginUser(values);
    };

    return (
      <Card className="form-container">
        <Flex gap="large">
          <Flex vertical flex={1}>
            <Typography.Title level={3} className="title">
              Login to your account
            </Typography.Title>
            <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="btn"
                  loading={loading}
                >
                  Login
                </Button>
              </Form.Item>

              {error && (
                <Typography.Text type="danger">
                  {error}
                </Typography.Text>
              )}

              <Form.Item>
                <Link to="/">
                  <Button size="large" className="btn">
                    Don't have an account? Register
                  </Button>
                </Link>
              </Form.Item>
            </Form>
          </Flex>

            <Flex flex={1}>
                <img src={registerImage} className="auth-image"/>
            </Flex>
      </Flex>
    </Card>
  );
};

export default Login;
