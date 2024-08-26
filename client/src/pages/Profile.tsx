import { Button } from "antd";
import Title from "antd/es/skeleton/Title";
import { FunctionComponent, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProfileProps {

}

interface UserData {
  userData: {
    _id: string;
    name: string;
    email: string;
    password: string;
    verify: number;
    __v: number;
  },
  userToken: string;
}

const Profile: FunctionComponent<ProfileProps> = () => {
  const {logout} = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  useEffect(() => {
    const userLocal = localStorage.getItem('user_data');
    if (userLocal !== null) {
      const parsedUserData: UserData = JSON.parse(userLocal);
      console.log(parsedUserData);
      setUserData(parsedUserData);
    } else {
      console.log('No userData found in localStorage');
    }
  }, []);
  return (
    <>
      <div>Profile</div>
      <div>Hello, {userData ? userData.userData.name : "Guest"}</div>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  );
}

export default Profile;
