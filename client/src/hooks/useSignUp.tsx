import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { message } from "antd";
import { useNavigate } from 'react-router-dom';

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UseSignUpReturn {
  loading: boolean;
  error: string | null;
  registerUser: (values: RegisterValues) => Promise<void>;
}

const useSignUp = (): UseSignUpReturn => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const registerUser = async (values: RegisterValues) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const res = await fetch("http://localhost:7070/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.status === 201) {
        message.success(data.message);
        navigate("/home");
      } else if (res.status === 400) {
        setError(data.message);
      } else {
        message.error("Registration failed");
      }
    } catch (error: any) {
      message.error("An error occurred during registration");
      setError(error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, registerUser };
};

export default useSignUp;
