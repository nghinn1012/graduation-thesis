import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { postFetcher } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useI18nContext } from "../../hooks/useI18nContext";

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { auth } = useAuthContext();
  const language = useI18nContext();
  const lang = language.of("OrderSection");

  const searchParams = new URLSearchParams(location.search);
  const orderType = searchParams.get("orderType");
  const isCOD = orderType === "cod";

  const codOrderData = isCOD ? location.state : null;

  const momoResult = !isCOD ? {
    partnerCode: searchParams.get("partnerCode"),
    orderId: searchParams.get("orderId"),
    requestId: searchParams.get("requestId"),
    amount: Number(searchParams.get("amount")),
    orderInfo: decodeURIComponent(searchParams.get("orderInfo") || ""),
    orderType: searchParams.get("orderType"),
    transId: searchParams.get("transId"),
    resultCode: searchParams.get("resultCode"),
    message: decodeURIComponent(searchParams.get("message") || ""),
    payType: searchParams.get("payType"),
    responseTime: Number(searchParams.get("responseTime")),
    extraData: searchParams.get("extraData"),
    signature: searchParams.get("signature"),
    isSuccess: searchParams.get("resultCode") === "0",
  } : null;

  // Get relevant data based on payment type
  const orderId = isCOD ? codOrderData?.orderId : searchParams.get("orderId");
  const amount = isCOD ? codOrderData?.amount : searchParams.get("amount");
  const orderInfo = isCOD ? codOrderData?.orderInfo : decodeURIComponent(searchParams.get("orderInfo") || "");
  const transId = !isCOD ? searchParams.get("transId") : null;
  const payType = !isCOD ? searchParams.get("payType") : "COD";
  const resultCode = !isCOD ? searchParams.get("resultCode") : "0";
  const message = !isCOD ? searchParams.get("message") : null;

  const isSuccess = isCOD || resultCode === "0";
  const langCode = language.language.code;

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
    const updatePaymentStatus = async () => {
      if (!auth?.token) {
        setUpdateError("Authentication token is missing");
        return;
      }

      try {
        setIsUpdating(true);
        setUpdateError(null);

        if (!isCOD && momoResult) {
          const response = await postFetcher.handleMoMoCallback(
            momoResult as any,
            auth.token
          );

          if (!response) {
            throw new Error(lang("transaction_failed"));
          }
        }
        // No need to update payment status for COD orders
      } catch (error) {
        setUpdateError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setIsUpdating(false);
      }
    };

    updatePaymentStatus();
  }, [auth?.token, isCOD]);

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-6">
      {isSuccess ? (
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        ) : (
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold text-gray-800">
          {isCOD ? lang("order-successful") : (isSuccess ? lang("payment-successful") : lang("payment-failed"))}
        </h1>
        <p className="text-gray-600 mt-2">
          {isCOD
            ? lang("thank-you-order-cod")
            : (isSuccess
              ? lang("thank-you-order")
              : lang("transaction-failed", message))}
        </p>
      </div>

      {updateError && !isCOD && (
        <div className="text-center mb-4">
          <p className="text-red-600">
            {lang("warning", updateError)}
          </p>
        </div>
      )}

      <div className="border rounded-lg p-6 shadow-lg bg-white hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          {isCOD ? lang("order-details") : lang("payment-details")}
        </h2>
        {orderId && (
          <p className="text-gray-600 mt-2">
            <strong>{lang("order-id")}:</strong> {orderId}
          </p>
        )}
        {!isCOD && transId && (
          <p className="text-gray-600 mt-2">
            <strong>{lang("transaction-id")}:</strong> {transId}
          </p>
        )}
        {amount && (
          <p className="text-gray-600 mt-2">
            <strong>{lang("amount")}:</strong>{" "}
            <span className="text-green-500 font-medium">
              {formatPrice(amount)}
            </span>
          </p>
        )}
        <p className="text-gray-600 mt-2">
          <strong>{lang("payment-method")}:</strong>{" "}
          {isCOD ? lang(
            "cash-on-delivery"
          ) : lang("qr-code")}
        </p>
        {orderInfo && (
          <p className="text-gray-600 mt-2">
            <strong>{lang("order-info")}:</strong> {orderInfo}
          </p>
        )}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/")}
          className="btn btn-primary flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          {lang("back-home")}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
