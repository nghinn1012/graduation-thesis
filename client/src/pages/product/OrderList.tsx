import React, { useEffect, useState, useRef } from "react";
import { useProductContext } from "../../context/ProductContext";
import { OrderWithUserInfo } from "../../api/post";
import { FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrderListSkeleton from "../../components/skeleton/OrderListSkeleton";
import OrderActionButtons from "../../components/order/OrderActionButtons";
import Pagination from "../../components/product/Pagination";
import { useI18nContext } from "../../hooks/useI18nContext";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("My Orders");
  const [myOrdersTab, setMyOrdersTab] = useState("All");
  const [shopOrdersTab, setShopOrdersTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

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
    loadingOrder,
    setLoadingOrder,
  } = useProductContext();
  const language = useI18nContext();
  const lang = language.of("OrderSection");

  const tabs = [
    { key: "All", label: lang("all") },
    { key: "Pending", label: lang("pending") },
    { key: "Delivering", label: lang("delivering") },
    { key: "Completed", label: lang("completed") },
    { key: "Cancelled By User", label: lang("cancelled by user") },
    { key: "Cancelled By Seller", label: lang("cancelled by seller") },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOrder(true);
      if (activeTab === "My Orders") {
        await fetchOrdersByUser();
      }
      if (activeTab === "Orders of My Shop") {
        await fetchOrderBySeller();
      }
      setLoadingOrder(false);
    };

    fetchData();
  }, [fetchOrdersByUser, fetchOrderBySeller, activeTab]);

  const handlePageChange = (page: number) => {
    setLoadingOrder(true);
    if (activeTab === "My Orders") {
      setPageUser(page);
    }
    if (activeTab === "Orders of My Shop") {
      setPageSeller(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setLoadingOrder(true);
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
      case "Delivering":
        return "badge-success";
      case "Completed":
        return "badge-info";
      case "Cancelled By Seller":
      case "Cancelled By User":
        return "badge-error";
      case "Pending":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  const handleStatusChange = (status: string) => {
    setLoadingOrder(true);
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

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`), { state: { orderId } };
  };

  const renderOrdersTable = (isMyOrders: boolean) => {
    const orders = isMyOrders ? ordersByUser : ordersBySeller;

    if (orders.length === 0 && !loadingOrder) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-xl font-semibold text-gray-500 mb-2">
            {lang("no-orders-found")}
          </div>
          <div className="text-sm text-gray-400">
            {isMyOrders ? lang("no-orders-my") : lang("no-orders-shop")}
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-sm">{lang("order-id")}</th>
                  <th className="text-sm">{lang("customer-name")}</th>
                  {isMyOrders && <th className="text-sm">{lang("address")}</th>}
                  <th className="text-sm">{lang("amount")}</th>
                  <th className="hidden sm:table-cell text-sm">
                    {lang("date")}
                  </th>
                  <th className="text-sm">{lang("status")}</th>
                  <th className="text-sm">{lang("action")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrder
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
                          <td
                            className="text-xs sm:text-sm whitespace-nowrap cursor-pointer truncate max-w-12"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            {order._id}
                          </td>
                          <td
                            className="text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            {order?.info?.name}
                          </td>
                          {isMyOrders && (
                            <td
                              className="text-xs sm:text-sm max-w-40 truncate cursor-pointer"
                              onClick={() => handleViewOrder(order._id)}
                            >
                              {order.address}
                            </td>
                          )}
                          <td
                            className="text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            ${order.amount}
                          </td>
                          <td
                            className="hidden sm:table-cell text-xs sm:text-sm whitespace-nowrap"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            {formatDate(order.createdAt)}
                          </td>
                          <td
                            className="text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <span
                              className={`badge badge-sm p-0 sm:badge-md ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {lang(order.status.toLowerCase())}
                            </span>
                          </td>
                          <td className="text-sm sm:text-sm">
                            <OrderActionButtons
                              order={order}
                              isMyOrders={isMyOrders}
                              activeTab={activeTab}
                              tab={isMyOrders ? myOrdersTab : shopOrdersTab}
                            />
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
          <h1 className="text-xl sm:text-2xl font-bold">{lang("orders")}</h1>
        </div>

        {/* Main Tabs */}
        <div className="tabs tabs-boxed mb-4 sm:mb-6 flex-nowrap overflow-x-auto">
          <button
            className={`tab tab-sm sm:tab-md flex-shrink-0 ${
              activeTab === "My Orders" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("My Orders")}
          >
            {lang("my-orders")}
          </button>
          <button
            className={`tab tab-sm sm:tab-md flex-shrink-0 ${
              activeTab === "Orders of My Shop" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("Orders of My Shop")}
          >
            {lang("shop-orders")}
          </button>
        </div>

        {/* Status Tabs */}
        <div className="tabs tabs-boxed mb-4 flex-nowrap overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab tab-sm sm:tab-md flex-shrink-0 ${
                (activeTab === "My Orders" ? myOrdersTab : shopOrdersTab) ===
                tab.key
                  ? "tab-active"
                  : ""
              }`}
              onClick={() => handleStatusChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderOrdersTable(activeTab === "My Orders")}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {activeTab === "My Orders"
            ? totalUserPages > 0 && (
                <Pagination
                  currentPage={
                    activeTab === "My Orders" ? pageUser : pageSeller
                  }
                  totalPages={
                    activeTab === "My Orders"
                      ? totalUserPages
                      : totalSellerPages
                  }
                  onPageChange={handlePageChange}
                  activeTab={activeTab}
                />
              )
            : totalSellerPages > 0 && (
                <Pagination
                  currentPage={
                    activeTab === "My Orders" ? pageUser : pageSeller
                  }
                  totalPages={
                    activeTab === "My Orders"
                      ? totalUserPages
                      : totalSellerPages
                  }
                  onPageChange={handlePageChange}
                  activeTab={activeTab}
                />
              )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
