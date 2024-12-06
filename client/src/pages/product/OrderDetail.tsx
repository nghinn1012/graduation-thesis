import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  BsStarFill,
  BsStar,
} from "react-icons/bs";
import { useProductContext } from "../../context/ProductContext";
import OrderActionButtons from "../../components/order/OrderActionButtons";
import { useAuthContext } from "../../hooks/useAuthContext";
import OrderActions from "../../components/order/OrderAction";
import { Review, ReviewCreate } from "../../api/post";
import CancelOrderModal from "../../components/order/CancelOrderModal";
import ReviewModal from "../../components/order/ReviewModal";
import { useI18nContext } from "../../hooks/useI18nContext";
import { useMessageContext } from "../../context/MessageContext";
import { useToastContext } from "../../hooks/useToastContext";

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

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <BsStarFill className="w-4 h-4 text-yellow-400" />
          ) : (
            <BsStar className="w-4 h-4 text-yellow-400" />
          )}
        </span>
      ))}
    </div>
  );
};

const OrderDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentOrderDetail,
    setCurrentOrderDetail,
    fetchOrderById,
    loading,
    setLoading,
    cancelOrder,
    updateOrderStatus,
    createOrderReview,
    errorProduct,
    setErrorProduct,
  } = useProductContext();
  const [orderId, setOrderId] = React.useState<string>("");
  const { account } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const language = useI18nContext();
  const lang = language.of("ReviewSection", "OrderSection");
  const {chatGroupSelect, setChatGroupSelect, chatGroups} = useMessageContext();
  const langCode = language.language.code;
  const { error, success } = useToastContext();

  function formatPrice(price: number): string {
    let currencyCode: string = "VND";

    if (langCode === "en") {
      currencyCode = "USD";
    }

    return new Intl.NumberFormat(langCode, {
      style: "currency",
      currency: currencyCode,
    }).format(price);
  }

  useEffect(() => {
    setLoading(true);
    if (location.state) {
      const orderId = location.state as string;
      setOrderId(orderId);
    }
    if (location.pathname.includes("/orders/")) {
      const orderId = location.pathname.split("/orders/")[1];
      setOrderId(orderId);
    }

    return () => {
      setCurrentOrderDetail(null);
    };
  }, [location.state, location.pathname, setCurrentOrderDetail]);

  useEffect(() => {
    const initialize = async () => {
      if (orderId) {
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentOrderDetail) return;
    try {
      const result = await updateOrderStatus(
        currentOrderDetail._id,
        newStatus,
        "Orders Of My Shop"
      );
      await fetchOrderById(orderId);
      return result;
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!currentOrderDetail) return;
    try {
      await cancelOrder(currentOrderDetail._id, reason, true, "My Orders");
      if (errorProduct) {
        error(errorProduct);
        setErrorProduct("");
      } else {
        success(lang("cancel-order-success"));
      }
      setIsCancelModalOpen(false);
      setCancelReason("");
      await fetchOrderById(orderId);
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleSubmitReviews = async (reviews: ReviewCreate[]) => {
    try {
      if (!currentOrderDetail) return;
      await createOrderReview(currentOrderDetail._id, reviews);
      if (errorProduct) {
        error(errorProduct);
        setErrorProduct("");
      } else {
        success(lang("submit-review-success"));
      }
      setIsReviewModalOpen(false);
      await fetchOrderById(orderId);
    } catch (error) {
      console.error("Error submitting reviews:", error);
    }
  };

  const handleChatCustomer = () => {
    console.log("Chatting with customer...");
    console.log(chatGroups);
    if (!currentOrderDetail) return;
    chatGroups.some((group) => {
      if (group.members.includes(currentOrderDetail?.userId) && group.members.includes(currentOrderDetail?.sellerId) && group.members.length === 2) {
        setChatGroupSelect(group);
        navigate(`/message`);
        return true;
      }
    });
  }
  if (!currentOrderDetail) {
    return <LoadingSkeleton />;
  }

  if (!currentOrderDetail) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <button
                className="btn btn-outline btn-sm w-full lg:w-auto"
                onClick={() => navigate(-1)}
              >
                <BsFileText className="w-4 h-4 mr-2" />
                {lang("go-back")}
              </button>
              <div className="mb-4 lg:mb-0">
                <h1 className="text-xl lg:text-2xl font-bold">
                  {lang("order-id")} {currentOrderDetail._id}
                </h1>
                <p className="text-sm lg:text-base text-base-content/70">
                  {lang("placed-on")}{" "}
                  {new Date(currentOrderDetail.createdAt).toLocaleDateString(
                    langCode === "en" ? "en-US" : "vi-VN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-center">
                <button className="btn btn-primary btn-sm w-full lg:w-auto" onClick={handleChatCustomer}>
                  <BsChat className="w-4 h-4 mr-2"/>
                  {lang("message-customer")}
                </button>
                <span
                  className={`badge ${getStatusBadge(
                    currentOrderDetail.status
                  )} badge-lg mt-1 lg:mt-0`}
                >
                  {lang(currentOrderDetail.status.toLowerCase())}
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
                    {lang("order-items")}
                  </h2>
                </div>
                <div className="flex-1 overflow-auto px-6 py-4">
                  <div className="space-y-4">
                    {currentOrderDetail.products.map((item, index) => (
                      <div key={index}>
                        {/* Product Info */}
                        <div className="flex items-center p-4 bg-base-200 rounded-box hover:bg-base-300 transition-colors">
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
                            <h4 className="font-medium">
                              {item.postInfo.title}
                            </h4>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-sm text-base-content/70">
                                {formatPrice(item.productInfo.price)}
                              </span>
                              <span className="font-medium">
                                {formatPrice(
                                  item.productInfo.price * item.quantity
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {currentOrderDetail.status === "Completed" &&
                          currentOrderDetail.isReviewed && (
                            <div className="mt-2">
                              <div className="collapse bg-base-100 border border-base-300 rounded-box">
                                <input type="checkbox" className="peer" />
                                <div className="collapse-title bg-base-200/50 text-sm font-medium peer-checked:bg-base-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <BsStarFill className="w-4 h-4 text-yellow-400" />
                                      {lang("your-review")}
                                    </div>
                                    {item.productInfo.reviews?.some(
                                      (review: Review) =>
                                        review.userId ===
                                        currentOrderDetail.userId
                                    ) ? (
                                      <span className="badge badge-success badge-sm">
                                        {lang("reviewed")}
                                      </span>
                                    ) : (
                                      <span className="badge badge-ghost badge-sm">
                                        {lang("no-reviews")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="collapse-content bg-base-100">
                                  {item.productInfo.reviews
                                    ?.filter(
                                      (review: Review) =>
                                        review.userId ===
                                          currentOrderDetail.userId &&
                                        review.orderId ===
                                          currentOrderDetail._id
                                    )
                                    .map(
                                      (review: Review, reviewIndex: number) => (
                                        <div
                                          key={reviewIndex}
                                          className="bg-base-100 rounded-lg p-4"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <RatingStars
                                              rating={review.rating}
                                            />
                                            <span className="text-sm text-base-content/70">
                                              {new Date(
                                                review.createdAt
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-sm mt-2">
                                            {review.review}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  {!item.productInfo.reviews?.some(
                                    (review: Review) =>
                                      review.userId ===
                                      currentOrderDetail.userId
                                  ) && (
                                    <div className="text-center text-base-content/70 py-4">
                                      {lang("have-not-review")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
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
                  {lang("customer-details")}
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

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <BsClock className="w-5 h-5 mr-2" />
                  {lang("order-status")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{lang("status")}</span>
                    <span
                      className={`badge
                        ${
                          currentOrderDetail.status === "Pending"
                            ? "badge-warning"
                            : currentOrderDetail.status === "Processing"
                            ? "badge-info"
                            : currentOrderDetail.status === "Completed"
                            ? "badge-success"
                            : [
                                "Cancelled By User",
                                "Cancelled By Seller",
                              ].includes(currentOrderDetail.status)
                            ? "badge-error"
                            : ""
                        }
                      `}
                    >
                      {lang(currentOrderDetail.status.toLowerCase())}
                    </span>
                  </div>

                  {["Cancelled By User", "Cancelled By Seller"].includes(
                    currentOrderDetail.status
                  ) &&
                    currentOrderDetail.reason && (
                      <div className="flex flex-col">
                        <span className="text-base-content/70">
                          {lang("reason")}:{" "}
                          <span className="font-semibold">
                            {lang(currentOrderDetail.reason)}
                          </span>
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
                  {lang("payment-summary")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-base-content/70">
                    <span>{lang("subtotal")}</span>
                    <span>{formatPrice(currentOrderDetail.amount - currentOrderDetail.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>{lang("shipping-fee")}</span>
                    <span>{formatPrice(currentOrderDetail.shippingFee)}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{lang("total")}</span>
                    <span className="text-primary">

                      {formatPrice(
                        currentOrderDetail.amount
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}

            <OrderActions
              order={currentOrderDetail}
              account={account}
              onUpdateStatus={handleUpdateStatus}
              isMyOrders={account?._id === currentOrderDetail.userId}
              onOpenCancelModal={() => setIsCancelModalOpen(true)}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              // isUpdating={isUpdating}
            />
          </div>
        </div>
      </div>
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelReason("");
        }}
        onCancel={handleCancelOrder}
        selectedReason={cancelReason}
        onReasonChange={setCancelReason}
        isSeller={account?._id !== currentOrderDetail.userId}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReviews}
        orderId={currentOrderDetail._id}
      />
    </div>
  );
};

export default OrderDetails;
