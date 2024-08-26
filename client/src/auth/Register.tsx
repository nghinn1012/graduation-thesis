import { Card, Form, Input, Typography, Button, Flex } from "antd";
import { FunctionComponent } from "react";
import registerImage from "../assets/register.jpg";
import { Link } from "react-router-dom";
import useSignUp from "../hooks/useSignUp";
import { GoogleLogin } from '@react-oauth/google';

interface RegisterProps {}

const Register: FunctionComponent<RegisterProps> = () => {
  const { loading, error, registerUser } = useSignUp();

  const handleRegister = (values: any) => {
    registerUser(values);
  };

  return (
    <Card className="form-container">
      <Flex gap="large">
        <Flex vertical flex={1}>
          <Typography.Title level={3} className="title">
            Create an account
          </Typography.Title>
          <Typography.Text type="secondary" strong className="slogan">
            Join for exclusive access!
          </Typography.Text>
          <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
            {/* Full Name Field */}
            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            {/* Email Field */}
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

            {/* Password Field */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
                {
                  pattern: /[A-Z]/,
                  message: "Password must contain at least one uppercase letter!",
                },
                {
                  pattern: /[0-9]/,
                  message: "Password must contain at least one digit!",
                },
                {
                  pattern: /[!@#$%^&*(),.?":{}|<>]/,
                  message: "Password must contain at least one special character!",
                },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            {/* Confirm Password Field */}
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm password" />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="btn"
                loading={loading} // Properly handle loading state
              >
                Register
              </Button>
            </Form.Item>

            {/* Error Handling */}
            {error && (
              <Typography.Text type="danger">
                {error}
              </Typography.Text>
            )}


            {/* Login Link */}
            <Form.Item>
              <Link to="/login">
                <Button size="large" className="btn">
                  Have an account? Login
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </Flex>

        {/* Registration Image */}
        <Flex flex={1}>
          <img src={registerImage} className="auth-image" alt="Register" />
        </Flex>
      </Flex>
    </Card>
  );
};

export default Register;
