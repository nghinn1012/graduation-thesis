import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import {
  createOrderData,
  OrderInfo,
  postFetcher,
  ProductCart,
} from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FaArrowLeft, FaCcMastercard, FaQrcode } from "react-icons/fa6";
import ShippingAddressSection from "../../components/product/ShippingAddress";

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
  paymentMethod: "qr_code" | "credit_card";
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  shippingMethod: "standard" | "express";
};

const validateFormData = (data: FormData): Partial<FormData> => {
  const errors: Partial<FormData> = {};

  if (!data.recipientName) errors.recipientName = "Recipient name is required";
  if (!data.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^\d{10}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Phone number must be 10 digits";
  }
  if (!data.address) errors.address = "Address is required";

  if (data.paymentMethod === "credit_card") {
    if (!data.cardNumber) errors.cardNumber = "Card number is required";
    else if (!/^\d{16}$/.test(data.cardNumber))
      errors.cardNumber = "Must be 16 digits";

    if (!data.cardHolder) errors.cardHolder = "Card holder name is required";
    if (!data.expiryDate) errors.expiryDate = "Expiry date is required";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate))
      errors.expiryDate = "Must be in MM/YY format";

    if (!data.cvv) errors.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(data.cvv)) errors.cvv = "Must be 3 or 4 digits";
  }

  return errors;
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

  const [formData, setFormData] = useState<FormData>({
    recipientName: "",
    phoneNumber: "",
    address: "",
    shippingMethod: "standard",
    paymentMethod: "qr_code",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item._id)
  );

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
      setDeliveryFee(10);
      setTotalTransaction(total + 10);
    } else {
      setDeliveryFee(5);
      setTotalTransaction(total + 5);
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
          if (currentOrder) {
            return {
              orderNumber: currentOrder?._id,
              totalAmount: calculateOrderTotal(groupedProducts[order.sellerId]),
              deliveryAddress: formData.address,
            };
          }
          return null;
        });

        const results = (await Promise.all(orderPromises)).filter(
          (result) => result !== null
        );
        setOrderResults(
          results as {
            orderNumber: string;
            totalAmount: number;
            deliveryAddress: string;
          }[]
        );
      } catch (error) {
        console.error("Error creating orders:", error);
      }
    }
  };

  useEffect(() => {
    if (
      orderResults.length > 0 &&
      !orderResults.includes({
        orderNumber: "",
        totalAmount: 0,
        deliveryAddress: "",
      })
    ) {
      navigate("/payment-success", {
        state: { orderResults },
      });
      removeProductFromCart(
        selectedProducts.map((product) => product.productId)
      );
    }
  }, [orderResults, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Information Header */}
            <div className="card bg-base-100">
              <div className="card-body flex flex-row items-center justify-center">
                <button
                  className="btn btn-square btn-sm mr-3"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="card-title font-semibold text-center flex-1 text-2xl">
                  Thông tin đặt hàng
                </h1>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-center">Thông tin giao hàng</h2>

                <div className="space-y-4">
                  {/* Recipient Name */}
                  <div>
                    <label className="label">
                      <span className="label-text">Tên người nhận</span>
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
                      <span className="label-text">Số điện thoại</span>
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
                      <span className="label-text">Địa chỉ giao hàng</span>
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
                  Phương thức vận chuyển
                </h2>
                <div className="space-y-4">
                  {/* Standard Shipping */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Giao hàng tiêu chuẩn
                        <br />
                        <span className="text-sm opacity-70">
                          3-5 ngày - $5
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
                        Giao hàng nhanh
                        <br />
                        <span className="text-sm opacity-70">
                          1-2 ngày - $10
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
                  Phương thức thanh toán
                </h2>
                <div className="space-y-4">
                  {/* QR Code Payment */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center gap-2">
                        <FaQrcode /> Thanh toán QR Code
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

                  {/* Credit Card Payment */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center gap-2">
                        <FaCcMastercard /> Thẻ tín dụng
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === "credit_card"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                    </label>
                  </div>

                  {/* Credit Card Details */}
                  {formData.paymentMethod === "credit_card" && (
                    <div className="mt-4 space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="label">
                          <span className="label-text">Số thẻ</span>
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={`input input-bordered w-full ${
                            errors.cardNumber ? "input-error" : ""
                          }`}
                        />
                        {errors.cardNumber && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.cardNumber}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Card Holder */}
                      <div>
                        <label className="label">
                          <span className="label-text">Tên chủ thẻ</span>
                        </label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={formData.cardHolder}
                          onChange={handleInputChange}
                          className={`input input-bordered w-full ${
                            errors.cardHolder ? "input-error" : ""
                          }`}
                        />
                        {errors.cardHolder && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.cardHolder}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Expiry Date and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text">Ngày hết hạn</span>
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`input input-bordered w-full ${
                              errors.expiryDate ? "input-error" : ""
                            }`}
                          />
                          {errors.expiryDate && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.expiryDate}
                              </span>
                            </label>
                          )}
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text">CVV</span>
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={`input input-bordered w-full ${
                              errors.cvv ? "input-error" : ""
                            }`}
                          />
                          {errors.cvv && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.cvv}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="card bg-base-100 shadow sticky top-6">
            <div className="card-body">
              <h2 className="card-title">Tóm tắt đơn hàng</h2>

              {Object.entries(groupedProducts).map(([authorId, products]) => (
                <div key={authorId} className="mb-6">
                  <h3 className="font-medium mb-2">
                    Người bán: {products[0].author.name}
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
                            Số lượng: {product.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            ${product.productInfo?.price * product.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2">
                      <label className="label">
                        <span className="label-text">
                          Ghi chú cho người bán
                        </span>
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
                  <span>Tạm tính</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-sm opacity-70">
                  <span>Phí vận chuyển</span>
                  <span>${deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-4">
                  <span>Tổng cộng</span>
                  <span>${totalTransaction}</span>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary btn-block mt-6"
              >
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
