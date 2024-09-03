import { useGoogleLogin } from 'react-use-googlelogin';
import { GOOGLE_CLIENT_ID } from '../../config/config';
import { userFetcher } from '../../api/user';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { HookConfig } from 'react-use-googlelogin/dist/types';

const CustomGoogleButton = () => {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const handleSuccess = (tokenResponse: any) => {
    try {
      userFetcher
      .loginWithGoogle(tokenResponse.credential)
      .then((response) => {
        console.log(response);
        toast.success("Account created successfully");
        setTimeout(() => {
          navigate("/"),
          auth.setAccount(response.user);
          auth.setToken(response.token.toString() || "")
        }, 2000);
      })
      .catch((error) => {
        toast.error(error);
      });
    } catch (error) {
      toast.error(error as string);
    }
  }
  const { signIn } = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    onSuccess: handleSuccess,
    onError: () => console.log('Login Failed'),
    plugin_name:'Social Cookbook',
  } as HookConfig);

  return (

  );
};

export default CustomGoogleButton;
