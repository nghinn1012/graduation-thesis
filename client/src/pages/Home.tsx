import { Button } from "antd";
import Title from "antd/es/skeleton/Title";
import { FunctionComponent } from "react";
import { useAuth } from "../contexts/AuthContext";

interface HomeProps {

}

const Home: FunctionComponent<HomeProps> = () => {
  const {logout} = useAuth();
  return (
    <>
      <div>Home</div>
      <Button onClick={logout}>Logout</Button>
    </>
  );
}

export default Home;
