import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BsChat,
  BsBox,
  BsTelephone,
  BsGeoAlt,
  BsFileText,
  BsClock,
  BsPrinter,
  BsFileEarmarkPdf,
  BsPeopleFill,
  BsPeople,
} from "react-icons/bs";
import { useProductContext } from "../../context/ProductContext";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-base-200 py-8 animate-pulse">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 w-48 bg-base-300 rounded"></div>
                <div className="h-4 w-32 bg-base-300 rounded mt-2"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-32 bg-base-300 rounded"></div>
                <div className="h-8 w-24 bg-base-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items Skeleton */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl h-[calc(100vh-13rem)]">
              <div className="card-body">
                <div className="h-6 w-32 bg-base-300 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center p-4 bg-base-200 rounded-box"
                    >
                      <div className="w-16 h-16 bg-base-300 rounded-lg"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 w-3/4 bg-base-300 rounded"></div>
                        <div className="h-4 w-1/4 bg-base-300 rounded mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeletons */}
          <div className="space-y-6">
            {/* Customer Info Skeleton */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="h-6 w-40 bg-base-300 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-base-300 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Summary Skeleton */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="h-6 w-40 bg-base-300 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-base-300 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="h-6 w-32 bg-base-300 rounded mb-4"></div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-full bg-base-300 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetails: React.FC = () => {
  const location = useLocation();
  const {
    currentOrderDetail,
    setCurrentOrderDetail,
    fetchOrderById,
    loading,
    setLoading,
  } = useProductContext();
  const [orderId, setOrderId] = React.useState<string>("");

  useEffect(() => {
    if (location.state) {
      const orderId = location.state as string;
      setOrderId(orderId);
    }
    if (location.pathname.includes("/orders/")) {
      const orderId = location.pathname.split("/orders/")[1];
      setOrderId(orderId);
    }
  }, [location.state, location.pathname]);

  useEffect(() => {
    const initialize = async () => {
      if (orderId) { // Ensure orderId is not empty
        setLoading(true);
        console.log("Fetching orderId:", orderId);
        await fetchOrderById(orderId);
      }
    };

    initialize();
  }, [fetchOrderById, orderId]);
  useEffect(() => {
    if (currentOrderDetail) {
      setLoading(false);
    }
  }, [currentOrderDetail]);

  const getStatusBadge = (status: string): string => {
    const statusColors: Record<OrderStatus, string> = {
      pending: "badge-warning",
      processing: "badge-info",
      completed: "badge-success",
      cancelled: "badge-error",
    };

    return statusColors[status.toLowerCase() as OrderStatus] || "badge-ghost";
  };

  if (!currentOrderDetail) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  Order #{currentOrderDetail._id}
                </h1>
                <p className="text-base-content/70">
                  Placed on{" "}
                  {new Date(currentOrderDetail.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary btn-sm">
                  <BsChat className="w-4 h-4 mr-2" />
                  Message Customer
                </button>
                <span
                  className={`badge ${getStatusBadge(
                    currentOrderDetail.status
                  )} badge-lg mt-1`}
                >
                  {currentOrderDetail.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items Section */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl h-full flex flex-col">
              <div className="card-body flex flex-col p-0">
                <div className="p-6 pb-0">
                  <h2 className="card-title text-lg">
                    <BsBox className="w-5 h-5 mr-2" />
                    Order Items
                  </h2>
                </div>
                {/* Scrollable container */}
                <div className="flex-1 overflow-auto px-6 py-4">
                  <div className="space-y-4">
                    {currentOrderDetail.products.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-base-200 rounded-box hover:bg-base-300 transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={item.postInfo.images[0]}
                            alt={item.postInfo.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <span className="badge badge-primary badge-sm absolute -top-2 -right-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium">{item.postInfo.title}</h4>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm text-base-content/70">
                              ${item.productInfo.price}
                            </span>
                            <span className="font-medium">
                              $
                              {(item.productInfo.price * item.quantity).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Payment Details */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <BsFileText className="w-5 h-5 mr-2" />
                  Customer Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BsPeople className="w-4 h-4 mr-2" />
                    <span>{currentOrderDetail.info.name}</span>
                  </div>
                  <div className="flex items-center">
                    <BsTelephone className="w-4 h-4 mr-2" />
                    <span>{currentOrderDetail.info.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <BsGeoAlt className="w-4 h-4 mr-2 mt-1" />
                    <span>{currentOrderDetail.address}</span>
                  </div>
                  {currentOrderDetail.info.note && (
                    <div className="flex items-start">
                      <BsFileText className="w-4 h-4 mr-2 mt-1" />
                      <span className="text-sm italic">
                        {currentOrderDetail.info.note}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <BsClock className="w-5 h-5 mr-2" />
                  Payment Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal</span>
                    <span>${currentOrderDetail.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Delivery Fee</span>
                    <span>${(currentOrderDetail.shippingFee).toFixed(2)}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ${(currentOrderDetail.amount + currentOrderDetail.shippingFee).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Actions</h2>
                <div className="space-y-2">
                  <button className="btn btn-outline btn-block">
                    <BsPrinter className="w-4 h-4 mr-2" />
                    Print Order
                  </button>
                  <button className="btn btn-outline btn-block">
                    <BsFileEarmarkPdf className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
