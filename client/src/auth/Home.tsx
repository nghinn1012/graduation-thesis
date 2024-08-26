import { FunctionComponent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Login from "./Login";

interface HomeProps {

}

const Home: FunctionComponent<HomeProps> = () => {
  const navigate = useNavigate();
  return (
    <>
    <div>Home</div>
    </>
   );
}

export default Home;
