import React, { useEffect, useState } from "react";
import CardDataStats from "../../components/admin/CardDataStats";
import ChartOne from "../../components/admin/ChartOne";
import ChartTwo from "../../components/admin/ChartTwo";
import { AiOutlineEye } from "react-icons/ai";
import { FiShoppingCart } from "react-icons/fi";
import { BiDish, BiPackage } from "react-icons/bi";
import { HiOutlineUsers } from "react-icons/hi";
import { postFetcher } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useAdminUserContext } from "../../context/AdminUserContext";
import { BsPostcard } from "react-icons/bs";
import { useI18nContext } from "../../hooks/useI18nContext";

interface OrderStats {
  total: number;
  successful: number;
  percentage: number;
}

interface DashboardData {
  orderAnalytics: {
    daily: OrderStats;
    weekly: OrderStats;
    monthly: OrderStats;
  };
  totalStats: {
    totalPosts: number;
    totalProducts: number;
    totalOrders: number;
  };
}

const DashBoard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuthContext();
  const { users } = useAdminUserContext();
  const language = useI18nContext();
  const lang = language.of("AdminSection");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!auth?.token) return;
        const response = (await postFetcher.getDashboard(
          auth?.token
        )) as unknown as DashboardData;
        setData(response);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {lang("loading")}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-red-500">{error || "Something went wrong"}</div>
    );
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(2);
  };

  const orderGrowth = calculateGrowth(
    data.orderAnalytics.daily.total,
    data.orderAnalytics.daily.total - data.orderAnalytics.daily.successful
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title={lang("total-users")}
          total={users.length.toLocaleString()}
          rate="0.43%"
          levelUp
        >
          <HiOutlineUsers className="fill-primary" size={22} />
        </CardDataStats>

        <CardDataStats
          title={lang("total-orders")}
          total={data.totalStats.totalOrders.toLocaleString()}
          rate={`${orderGrowth}%`}
          levelUp={Number(orderGrowth) > 0}
        >
          <BiPackage className="fill-primary" size={22} />
        </CardDataStats>

        <CardDataStats
          title={lang("total-products")}
          total={data.totalStats.totalProducts.toLocaleString()}
          rate="2.59%"
          levelUp
        >
          <BiDish className="fill-primary" size={22} />
        </CardDataStats>

        <CardDataStats
          title={lang("total-posts")}
          total={data.totalStats.totalPosts.toLocaleString()}
          rate="0.43%"
          levelDown
        >
          <BsPostcard  className="fill-primary" size={22} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne
          data={{
            daily: data.orderAnalytics.daily,
            weekly: data.orderAnalytics.weekly,
            monthly: data.orderAnalytics.monthly,
          }}
        />
        <ChartTwo
          orderStats={{
            total: data.totalStats.totalOrders,
            successful: data.orderAnalytics.monthly.successful,
            percentage: data.orderAnalytics.monthly.percentage,
          }}
        />
      </div>
    </>
  );
};

export default DashBoard;
