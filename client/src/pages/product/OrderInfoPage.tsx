import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import {
  createOrderData,
  MomoPaymentResponse,
  OrderInfo,
  postFetcher,
  ProductCart,
} from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import {
  FaArrowLeft,
  FaCashRegister,
  FaCcMastercard,
  FaQrcode,
} from "react-icons/fa6";
import ShippingAddressSection from "../../components/product/ShippingAddress";
import { useI18nContext } from "../../hooks/useI18nContext";
import { useToastContext } from "../../hooks/useToastContext";
import { Toaster } from "react-hot-toast";

type GroupedProducts = {
  [key: string]: ProductCart[];
};

type Notes = {
  [key: string]: string;
};

type FormData = {
  recipientName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: "qr_code" | "cod";
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  shippingMethod: "standard" | "express";
};

const OrderInfoPage: React.FC = () => {
  const {
    cart,
    selectedItems,
    removeProductFromCart,
    createOrder,
    currentOrder,
  } = useProductContext();
  const [notes, setNotes] = useState<Notes>({});
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState<number>(5);
  const [totalTransaction, setTotalTransaction] = useState<number>(0);
  const { auth } = useAuthContext();
  const [orderResults, setOrderResults] = useState<
    { orderNumber: string; totalAmount: number; deliveryAddress: string }[]
  >([]);
  const {error} = useToastContext();

  const validateFormData = (data: FormData): Partial<FormData> => {
    const errors: Partial<FormData> = {};

    if (!data.recipientName) errors.recipientName = lang("name-required");
    if (!data.phoneNumber) {
      errors.phoneNumber = lang("phone-required");
    } else if (!/^\d{10}$/.test(data.phoneNumber)) {
      errors.phoneNumber = lang("phone-invalid");
    }
    if (!data.address) errors.address = lang("address-required");

    return errors;
  };

  const [formData, setFormData] = useState<FormData>({
    recipientName: "",
    phoneNumber: "",
    address: "",
    shippingMethod: "standard",
    paymentMethod: "cod",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const languageContext = useI18nContext();
  const lang = languageContext.of("OrderSection");
  const langCode = languageContext.language.code;

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item._id)
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString(langCode, {
      style: "currency",
      currency: langCode === "vi" ? "VND" : "USD",
      minimumFractionDigits: 0,
    });
  };

  const groupedProducts: GroupedProducts = selectedProducts.reduce(
    (acc: GroupedProducts, product: ProductCart) => {
      const authorId = product.author._id || "unknown";
      if (!acc[authorId]) {
        acc[authorId] = [];
      }
      acc[authorId].push(product);
      return acc;
    },
    {}
  );

  const calculateOrderTotal = (products: ProductCart[]) => {
    return products.reduce(
      (sum, item) => sum + (item.productInfo?.price || 0) * item.quantity,
      0
    );
  };

  const total = selectedProducts.reduce(
    (sum, item) => sum + (item.productInfo?.price || 0) * item.quantity,
    0
  );

  useEffect(() => {
    if (formData.shippingMethod === "express") {
      setDeliveryFee(50000);
      setTotalTransaction(total + 50000);
    } else {
      setDeliveryFee(20000);
      setTotalTransaction(total + 20000);
    }
  }, [formData.shippingMethod, total]);

  useEffect(() => {
    const newErrors: Partial<FormData> = validateFormData(formData);
    setErrors(newErrors);
  }, [formData]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate("/cart");
    }
  }, [selectedProducts, navigate]);

  const handleDeliveryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNoteChange = (authorId: string, value: string) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [authorId]: value,
    }));
  };

  const validateForm = () => {
    const formErrors = validateFormData(formData);
    setErrors(formErrors);
    return Object.values(formErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    if (validateForm()) {
      const ordersByAuthor = Object.entries(groupedProducts).map(
        ([authorId, products]) => ({
          sellerId: authorId,
          products: products.map((product) => ({
            _id: product.productId,
            quantity: product.quantity,
          })),
        })
      );

      try {
        const orderPromises = ordersByAuthor.map(async (order) => {
          const data = {
            sellerId: order.sellerId,
            products: order.products.map((product) => ({
              productId: product._id,
              quantity: product.quantity,
            })),
            info: {
              name: formData.recipientName,
              phone: formData.phoneNumber,
              address: formData.address,
              note: notes[order.sellerId] || "",
            },
            address: formData.address,
            shippingFee: deliveryFee,
            note: notes[order.sellerId] || "",
            paymentMethod: formData.paymentMethod,
            amount: calculateOrderTotal(groupedProducts[order.sellerId]),
          };

          const response = await createOrder(data as OrderInfo);

          if (response && formData.paymentMethod === "qr_code") {
            try {
              const res = await postFetcher.paymentWithMoMo(
                response._id,
                calculateOrderTotal(groupedProducts[order.sellerId]) + deliveryFee,
                "http://localhost:3000/payment-success",
                auth.token
              ) as unknown as MomoPaymentResponse;

              if (!res) {
                error("Failed to create payment request");
                return null;
              }
              if (res && res.resultCode === 0) {
                removeProductFromCart(
                  selectedProducts.map((product) => product.productId)
                );
                window.location.href = res.payUrl;
              }
            } catch (error) {
              console.error("Error creating payment request:", error);
              return null;
            }
          };
          if (response && response._id && formData.paymentMethod === "cod") {
            return {
              orderNumber: response._id,
              totalAmount: calculateOrderTotal(groupedProducts[order.sellerId]),
              deliveryAddress: formData.address,
            };
          }
          return null;
        });

        const results = (await Promise.all(orderPromises)).filter(
          (result) => result !== null
        );

        if (results.length > 0) {
          setOrderResults(
            results as {
              orderNumber: string;
              totalAmount: number;
              deliveryAddress: string;
            }[]
          );

          navigate(`/payment-success?orderType=cod`, {
            state: {
              orderResults: results,
            },
          });
          removeProductFromCart(
            selectedProducts.map((product) => product.productId)
          );
        } else {
          throw new Error("Failed to create any orders");
        }
      } catch (error) {
        console.error("Error creating orders:", error);
      }
    }
  };

  const handleClickBack = (event: any) => {
    event.preventDefault();
    navigate(-1);
  }

  // useEffect(() => {
  //   if (
  //     orderResults.length > 0 &&
  //     !orderResults.includes({
  //       orderNumber: "",
  //       totalAmount: 0,
  //       deliveryAddress: "",
  //     })
  //   ) {
  //     navigate("/payment-success", {
  //       state: { orderResults },
  //     });
  //   }
  // }, [orderResults, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <Toaster/>
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Information Header */}
            <div className="card bg-base-100">
              <div className="card-body flex flex-row items-center justify-center">
                <button
                  className="btn btn-square btn-sm mr-3"
                  onClick={handleClickBack}
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="card-title font-semibold text-center flex-1 text-2xl">
                  {lang("order-info")}{" "}
                </h1>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-center">
                  {lang("shipping-info")}
                </h2>

                <div className="space-y-4">
                  {/* Recipient Name */}
                  <div>
                    <label className="label">
                      <span className="label-text">
                        {lang("recipient-name")}
                      </span>
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      className={`input input-bordered w-full ${
                        errors.recipientName ? "input-error" : ""
                      }`}
                    />
                    {errors.recipientName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.recipientName}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="label">
                      <span className="label-text">
                        {lang("recipient-phone")}
                      </span>
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`input input-bordered w-full ${
                        errors.phoneNumber ? "input-error" : ""
                      }`}
                    />
                    {errors.phoneNumber && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.phoneNumber}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="label">
                      <span className="label-text">
                        {lang("recipient-address")}
                      </span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`textarea textarea-bordered w-full ${
                        errors.address ? "textarea-error" : ""
                      }`}
                    />
                    {errors.address && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.address}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-center">
                  {lang("delivery-method")}
                </h2>
                <div className="space-y-4">
                  {/* Standard Shipping */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        {lang("standard-delivery")}
                        <br />
                        <span className="text-sm opacity-70">
                          {lang("standard-delivery-desc")}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === "standard"}
                        onChange={handleDeliveryChange}
                        className="radio radio-primary"
                      />
                    </label>
                  </div>
                  {/* Express Shipping */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        {lang("express-delivery")}
                        <br />
                        <span className="text-sm opacity-70">
                          {lang("express-delivery-desc")}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === "express"}
                        onChange={handleDeliveryChange}
                        className="radio radio-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-center">
                  {lang("payment-method")}
                </h2>
                <div className="space-y-4">

                  {/* Credit Card Payment */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center gap-2">
                        <FaCashRegister /> {lang("cash-on-delivery")}
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                    </label>
                  </div>
                  {/* QR Code Payment */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center gap-2">
                        <FaQrcode /> {lang("qr-code")}
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="qr_code"
                        checked={formData.paymentMethod === "qr_code"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="card bg-base-100 shadow sticky top-6">
            <div className="card-body">
              <h2 className="card-title">{lang("order-summary")}</h2>

              {Object.entries(groupedProducts).map(([authorId, products]) => (
                <div key={authorId} className="mb-6">
                  <h3 className="font-medium mb-2">
                    {lang("seller")}: {products[0].author.name}
                  </h3>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="flex space-x-4">
                        <div className="flex-shrink-0 w-20 h-20">
                          <img
                            src={
                              product.postInfo.images?.[0] || "/placeholder.jpg"
                            }
                            alt={product.postInfo?.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {product.postInfo?.title}
                          </h4>
                          <p className="mt-1 text-sm opacity-70">
                            {lang("quantity")}: {product.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {formatCurrency(
                              product.productInfo?.price * product.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2">
                      <label className="label">
                        <span className="label-text">{lang("note")} </span>
                      </label>
                      <textarea
                        value={notes[authorId] || ""}
                        onChange={(e) =>
                          handleNoteChange(authorId, e.target.value)
                        }
                        className="textarea textarea-bordered w-full"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="divider"></div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm opacity-70">
                  <span>{lang("subtotal")}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm opacity-70">
                  <span>{lang("shipping-fee")}</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-4">
                  <span>{lang("total")}</span>
                  <span>{formatCurrency(totalTransaction)}</span>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary btn-block mt-6"
              >
                {lang("place-order")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
