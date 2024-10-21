import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";

// Skeleton component for loading state
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-full mb-2"></div>
  </div>
);

const OrdersPage = () => {
  const [startDate, setStartDate] = useState("27/02/2023");
  const [endDate, setEndDate] = useState("13/03/2023");
  const [activeTab, setActiveTab] = useState("All Order");
  const [orderType, setOrderType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const {
    ordersBySeller,
    ordersByUser,
    fetchOrdersByUser,
    fetchOrderBySeller,
  } = useProductContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (orderType === 'my') {
        await fetchOrdersByUser();
      } else if (orderType === 'received') {
        await fetchOrderBySeller();
      } else {
        await Promise.all([fetchOrdersByUser(), fetchOrderBySeller()]);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [orderType, fetchOrdersByUser, fetchOrderBySeller]);

  const orders = [...ordersBySeller, ...ordersByUser];
  const tabs = [
    { name: "All Order", count: 31 },
    { name: "Pending", count: 1 },
    { name: "Delivered", count: 2 },
    { name: "Completed", count: 1 },
    { name: "Canceled", count: 1 },
  ];

  const filteredOrders =
    orderType === "all"
      ? orders
      : orderType === "my"
      ? ordersByUser
      : ordersBySeller;

  return (
    <div className="p-4 bg-base-200 min-h-screen">
      <div className="bg-base-100 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Orders List</h1>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm">Start Date</span>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered input-sm ml-2"
              />
            </div>
            <div>
              <span className="text-sm">End Date</span>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered input-sm ml-2"
              />
            </div>
            <button className="btn btn-warning btn-sm">Export CSV</button>
          </div>
        </div>

        <div className="flex flex-col mb-6">
          <div className="tabs tabs-boxed mb-4">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                className={`tab ${activeTab === tab.name ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.name}{" "}
                <span className="badge badge-sm ml-1">{tab.count}</span>
              </a>
            ))}
          </div>
          <div className="self-start">
            <select
              className="select select-sm"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="my">My Orders</option>
              <option value="received">Orders I Received</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Full Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Order Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6}><Skeleton /></td>
                  </tr>
                ))
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userInfo.name}</td>
                    <td>₹{order.amount}</td>
                    <td>{order.createdAt}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "Delivered"
                            ? "badge-success"
                            : order.status === "On the way"
                            ? "badge-info"
                            : order.status === "Canceled"
                            ? "badge-error"
                            : order.status === "Receive"
                            ? "badge-warning"
                            : "badge-ghost"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-2xl">⋮</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="mr-2">Show</span>
            <select className="select select-bordered select-sm w-20">
              <option>10</option>
            </select>
          </div>
          <div className="btn-group">
            <button className="btn btn-sm">1</button>
            <button className="btn btn-sm">2</button>
            <button className="btn btn-sm">3</button>
            <button className="btn btn-sm btn-active">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
