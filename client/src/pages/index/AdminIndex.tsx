import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from '../../common/admin/Loader';
import DefaultLayout from '../../common/admin/DefaultLayout';
import PageTitle from '../../common/admin/PageTitle';
import AdminLoginPage from '../admin/AdminLoginPage';
import DashBoard from '../admin/DashBoard';
import ComplaintPage from '../admin/ComplaintPage';
import UserManagementPage from '../admin/UserManagementPage';
function Admin() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        {/* <Route
          index
          element={
            <>
              <PageTitle title="eCommerce Dashboard | Admin Panel" />
              <ECommerce />
            </>
          }
        />
        <Route
          path="/calendar"
          element={
            <>
              <PageTitle title="Calendar | Admin Panel" />
              <Calendar />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile | Admin Panel" />
              <Profile />
            </>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | Admin Panel" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | Admin Panel" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables | Admin Panel" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | Admin Panel" />
              <Settings />
            </>
          }
        />
        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart | Admin Panel" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | Admin Panel" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | Admin Panel" />
              <Buttons />
            </>
          }
        /> */}
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Dashboard | Admin Panel" />
              <DashBoard />
            </>
          }
        />
        <Route
          path="/complaints"
          element={
            <>
              <PageTitle title="Complaints | Admin Panel" />
              <ComplaintPage />
            </>
          }
        />
        <Route
          path="/users"
          element={
            <>
              <PageTitle title="Login | Admin Panel" />
              <UserManagementPage />
            </>
          }
        />
        {/* <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | Admin Panel" />
              <SignUp />
            </>
          }
        /> */}
      </Routes>
    </DefaultLayout>
  );
}

export default Admin;
