import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { userFetcher } from '../../../api/user';

interface IAccountInfo {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface IWaitingEmailVerify {
  account: IAccountInfo;
}

function WaitingEmailVerify({ account }: IWaitingEmailVerify) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await userFetcher.manualRegister({
        name: `${account.firstName} ${account.lastName}`,
        email: account.email,
        password: account.password,
        confirmPassword: account.password,
      });
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-lg bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{("verify-your-account")}</h1>
      <p className="text-gray-600 mb-4">{("all-done-sent-active")}</p>
      <a
        href={`mailto:${account.email}`}
        className="text-blue-500 hover:underline mb-4 block"
      >
        {account.email}
      </a>
      <div className="flex items-center space-x-2">
        <p className="text-gray-600">not-recieved-email</p>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {loading ? 'Trying again...' : ("try-again")}
        </button>
      </div>
    </div>
  );
}

function AccountTokenVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") as string | undefined;


  useEffect(() => {
      if (!token) {
        console.error("Token not found");
        navigate("/error/page-wrong", { replace: true });
        return;
      }

      userFetcher.verifyEmail(token)
        .then((response: any) => {
          const account = response.data;
          navigate("/login", { state: account, replace: true });
        })
        .catch((error: any) => {
          console.error("Error verifying email:", error);
          navigate("/error/page-wrong", { replace: true });
        });
    });
  return (
    <div className="container mx-auto p-6 max-w-lg bg-white shadow-md rounded-lg text-center">
      <p className="text-gray-800">{("verifying")}...</p>
    </div>
  );
}

export default function SignUpVerifyPage() {
  const location = useLocation();
  const account = location.state as IAccountInfo | undefined;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {account ? (
        <WaitingEmailVerify account={account} />
      ) : (
        <AccountTokenVerify />
      )}
    </div>
  );
}
