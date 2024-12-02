import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userFetcher } from '../../../api/user';
import toast, { Toaster } from 'react-hot-toast';
import { useToastContext } from '../../../hooks/useToastContext';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useAuthContext } from '../../../hooks/useAuthContext';

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
  const { success, error } = useToastContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("VerifySection");
  const { auth } = useAuthContext();

  const handleResendClick = async () => {
    setLoading(true);
    try {
      await userFetcher.resendVerifyEmail(account.email);
      success(lang("resend-success"));
    } catch (err) {
      console.error(err);
      error(lang("resend-failed", lang(err as string)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg bg-white shadow-md rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{lang("verify-account")}</h1>
      <p className="text-gray-600 mb-4">{lang("email-sent")}</p>
      <a
        href={`mailto:${account.email}`}
        className="text-blue-500 hover:underline mb-4 block"
      >
        {account.email}
      </a>
      <div className="flex items-center space-x-2">
        <p className="text-gray-600">{lang("not-received")}</p>
        <button
          onClick={handleResendClick}
          disabled={loading}
          className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {loading ? lang("trying-again") : lang("resend")}
        </button>
      </div>
    </div>
  );
}


function AccountTokenVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToastContext();
  const token = new URLSearchParams(location.search).get("token") as string | undefined;
  const languageContext = useI18nContext();
  const lang = languageContext.of("VerifySection");

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
          success(lang("email-verified-success"));
          setTimeout(() => navigate("/login"), 1000);
        }
      })
      .catch((error: any) => {
        if (isMounted) {
          error(lang("email-verified-fail", error.message));
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
