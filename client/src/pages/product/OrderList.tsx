import React, { useEffect, useState, useRef } from "react";
import { useProductContext } from "../../context/ProductContext";
import { OrderWithUserInfo } from "../../api/post";
import { FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrderListSkeleton from "../../components/skeleton/OrderListSkeleton";
// import OrderActionButtons from "../../components/common/OrderActionButtons";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("My Orders");
  const [myOrdersTab, setMyOrdersTab] = useState("All");
  const [shopOrdersTab, setShopOrdersTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    ordersBySeller,
    ordersByUser,
    fetchOrdersByUser,
    fetchOrderBySeller,
    totalUserPages,
    totalSellerPages,
    pageUser,
    pageSeller,
    setPageUser,
    setPageSeller,
    statusUser,
    statusSeller,
    setStatusUser,
    setStatusSeller,
    limit,
    setLimit,
    loading,
    setLoading,
  } = useProductContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (activeTab === "My Orders") {
        await fetchOrdersByUser();
      }
      if (activeTab === "Orders of My Shop") {
        await fetchOrderBySeller();
      }
      setLoading(false);
    };

    fetchData();
  }, [fetchOrdersByUser, fetchOrderBySeller, activeTab]);

  const handlePageChange = (page: number) => {
    setLoading(true);
    if (activeTab === "My Orders") {
      setPageUser(page);
    }
    if (activeTab === "Orders of My Shop") {
      setPageSeller(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setLoading(true);
    setPageSize(size);
    if (activeTab === "My Orders") {
      setPageUser(1);
    }
    if (activeTab === "Orders of My Shop") {
      setPageSeller(1);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "badge-success";
      case "Completed":
        return "badge-info";
      case "Canceled":
        return "badge-error";
      case "Pending":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  const handleStatusChange = (status: string) => {
    setLoading(true);
    if (activeTab === "My Orders") {
      setPageUser(1);
      setMyOrdersTab(status);
      setStatusUser(status === "All" ? "" : status);
    }
    if (activeTab === "Orders of My Shop") {
      setPageSeller(1);
      setShopOrdersTab(status);
      setStatusSeller(status === "All" ? "" : status);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrdersTable = (isMyOrders: boolean) => {
    const orders = isMyOrders ? ordersByUser : ordersBySeller;

    return (
      <div className="overflow-x-auto w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-sm">Order Id</th>
                  <th className="text-sm">{"Customer Name"}</th>
                  {isMyOrders && <th className="text-sm">Address</th>}
                  <th className="text-sm">Amount</th>
                  <th className="hidden sm:table-cell text-sm">Date</th>
                  <th className="text-sm">Status</th>
                  <th className="text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td colSpan={isMyOrders ? 7 : 6}>
                          <OrderListSkeleton />
                        </td>
                      </tr>
                    ))
                  : orders
                      .slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )
                      .map((order) => (
                        <tr key={order._id} className="hover:bg-base-200">
                          <td className="text-xs sm:text-sm whitespace-nowrap">
                            ORD-${order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="text-xs sm:text-sm whitespace-nowrap">
                            {order?.info?.name}
                          </td>
                          {isMyOrders && (
                            <td className="text-xs sm:text-sm max-w-40 truncate">
                              {order.address}
                            </td>
                          )}
                          <td className="text-xs sm:text-sm whitespace-nowrap">
                            ${order.amount}
                          </td>
                          <td className="hidden sm:table-cell text-xs sm:text-sm whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="text-xs sm:text-sm whitespace-nowrap">
                            <span
                              className={`badge badge-sm p-0 sm:badge-md ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="text-sm sm:text-sm">
                            {/* <OrderActionButtons
                              order={order}
                              isMyOrders={isMyOrders}
                            /> */}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-4 bg-base-200 min-h-screen">
      <div className="bg-base-100 rounded-lg shadow p-3 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
        </div>

        {/* Main Tabs */}
        <div className="tabs tabs-boxed mb-4 sm:mb-6 flex-nowrap overflow-x-auto">
          <button
            className={`tab tab-sm sm:tab-md flex-shrink-0 ${
              activeTab === "My Orders" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("My Orders")}
          >
            My Orders
          </button>
          <button
            className={`tab tab-sm sm:tab-md flex-shrink-0 ${
              activeTab === "Orders of My Shop" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("Orders of My Shop")}
          >
            Orders of My Shop
          </button>
        </div>

        {/* Status Tabs */}
        <div className="tabs tabs-boxed mb-4 flex-nowrap overflow-x-auto">
          {["All", "Pending", "Delivered", "Completed", "Canceled"].map(
            (tab) => (
              <button
                key={tab}
                className={`tab tab-sm sm:tab-md flex-shrink-0 ${
                  (activeTab === "My Orders" ? myOrdersTab : shopOrdersTab) ===
                  tab
                    ? "tab-active"
                    : ""
                }`}
                onClick={() => handleStatusChange(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {renderOrdersTable(activeTab === "My Orders")}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Show</span>
            <select
              className="select select-bordered select-sm w-20"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="btn-group overflow-x-auto max-w-full">
            {Array.from({
              length: Math.ceil(
                activeTab === "My Orders" ? totalUserPages : totalSellerPages
              ),
            }).map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`btn btn-sm ${
                  activeTab === "My Orders"
                    ? pageUser === index + 1
                      ? "btn-active"
                      : ""
                    : pageSeller === index + 1
                    ? "btn-active"
                    : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
