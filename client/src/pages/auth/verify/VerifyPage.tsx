import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userFetcher } from '../../../api/user';
import toast, { Toaster } from 'react-hot-toast';

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
      toast.success("Email sent successfully!");
    } catch (error) {
      console.log(error);
      toast.error("A email was sent before. Please check your email");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-lg bg-white shadow-md rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Verify your account</h1>
      <p className="text-gray-600 mb-4">All done. Email was sent to your email.</p>
      <a
        href={`mailto:${account.email}`}
        className="text-blue-500 hover:underline mb-4 block"
      >
        {account.email}
      </a>
      <div className="flex items-center space-x-2">
        <p className="text-gray-600">Not received mail?</p>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {loading ? 'Trying again...' : "Resend"}
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
    let isMounted = true;
    if (!token) {
      navigate("/error/page-wrong", { replace: true });
      return;
    }

    userFetcher.verifyEmail(token)
      .then((response: any) => {
        if (isMounted) {
          const account = response.data;
          toast.success("Email verified successfully! Please login to continue");
          setTimeout(() => navigate("/login"), 1000);
        }
      })
      .catch((error: any) => {
        if (isMounted) {
          toast.error("Error verifying email: " + error.message);
          navigate("/error/page-wrong", { replace: true });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);
  return (
    <>
      <Toaster />
      <div className="container mx-auto p-6 max-w-lg bg-white shadow-md rounded-lg text-center">
        <p className="text-gray-800">{("verifying")}...</p>
      </div>
    </>
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
