import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token && verificationStatus === 'idle') {
      setVerificationStatus('loading');
      verifyEmail(token);
      navigate("/login");
    }
  }, [location, verificationStatus]);

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:7070/users/verifyUser?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        message.success(data.message || 'Email verified successfully!');
      } else {
        message.error(data.message || 'Email verification failed!');
        setVerificationStatus('error'); // Set status to error
      }
    } catch (error) {
      message.error('An error occurred during email verification.');
      setVerificationStatus('error'); // Set status to error
    }
  };

  return (
    <div>
      <h1>Verifying your email...</h1>
    </div>
  );
};

export default VerifyEmail;
