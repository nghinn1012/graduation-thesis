import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { message } from "antd";

interface LoginValues {
  email: string;
  password: string;
}

interface UseLoginReturn {
  loading: boolean;
  error: string | null;
  loginUser: (values: LoginValues) => Promise<void>;
}

const useLogin = (): UseLoginReturn => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loginUser = async (values: LoginValues) => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch("http://localhost:7070/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      console.log(res);

      if (res.status === 201) {
        message.success("Login successful!");
        login(data.token, data.user);
      } else if (res.status === 401 || res.status === 400) {
        message.error(data.error);
      } else {
        message.error("Login failed");
      }
    } catch (error: any) {
      message.error("An error occurred during login");
      setError(error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loginUser };
};

export default useLogin;
