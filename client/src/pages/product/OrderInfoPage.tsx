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
  const { auth } = useAuthContext();

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
  }, [formData.shippingMethod]);

  const handleDeliveryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Group products by author
      const ordersByAuthor = Object.entries(groupedProducts).map(
        ([authorId, products]) => ({
          sellerId: authorId,
          products: products.map((product) => ({
            _id: product._id,
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
          } else {
            return null;
          }
        });

        removeProductFromCart(
          selectedProducts.map((product) => product.productId)
        );

        const orderResults = await Promise.all(orderPromises);

        navigate("/payment-success", {
          state: orderResults,
        });
      } catch (error) {
        console.error("Error creating orders:", error);
      }
    }
  };

  const handleNoteChange = (authorId: string, value: string) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [authorId]: value,
    }));
  };

  useEffect(() => {
    const newErrors: Partial<FormData> = validateFormData(formData);
    setErrors(newErrors);
  }, [formData]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate("/cart");
    }
  }, [selectedProducts, navigate]);

  return (
    <div className="min-h-screen p-2">
      <div className="card mx-auto">
        <div className="card-body">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm mr-4"
            >
              <FaArrowLeft className="mr-2 w-6 h-6" />
            </button>
            <h2 className="card-title text-2xl">Order Summary</h2>
          </div>

          {/* Display orders grouped by author */}
          {Object.entries(groupedProducts).map(([authorId, products]) => (
            <div key={authorId} className="mb-8 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Order from {products[0].author.name}
              </h3>
              <div className="space-y-4 mb-4">
                {products.map((item) => (
                  <div
                    key={item._id}
                    className="card card-side bg-base-200 w-full"
                  >
                    <figure className="w-24 h-24">
                      <img
                        src={
                          item.postInfo.images[0] || "/placeholder-image.jpg"
                        }
                        alt={item.postInfo?.title}
                        className="object-cover w-full h-full"
                      />
                    </figure>
                    <div className="card-body p-2">
                      <h4 className="card-title text-sm">
                        {item.postInfo?.title}
                      </h4>
                      <p className="text-xs">Quantity: {item.quantity}</p>
                      <p className="font-semibold text-sm">
                        ${item.productInfo?.price || 0} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Note input for each group */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Note for this order</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Add a note for this order"
                  value={notes[authorId] || ""}
                  onChange={(e) => handleNoteChange(authorId, e.target.value)}
                ></textarea>
              </div>
              {/* Order total for this group */}
              <div className="mt-4 text-right">
                <p className="font-semibold">
                  Order Total: ${calculateOrderTotal(products).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit}>
            {/* Delivery Information */}
            <h3 className="text-xl font-semibold mb-4">Delivery Information</h3>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Recipient Name</span>
              </label>
              <input
                type="text"
                name="recipientName"
                placeholder="Enter recipient's name"
                className={`input input-bordered w-full ${
                  errors.recipientName ? "input-error" : ""
                }`}
                value={formData.recipientName}
                onChange={handleInputChange}
              />
              {errors.recipientName && (
                <p className="text-error mt-1">{errors.recipientName}</p>
              )}
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter phone number"
                className={`input input-bordered w-full ${
                  errors.phoneNumber ? "input-error" : ""
                }`}
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
              {errors.phoneNumber && (
                <p className="text-error mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Delivery Address</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter your delivery address"
                className={`input input-bordered w-full ${
                  errors.address ? "input-error" : ""
                }`}
                value={formData.address}
                onChange={handleInputChange}
              />
              {errors.address && (
                <p className="text-error mt-1">{errors.address}</p>
              )}
            </div>

            {/* Payment method selection */}
            <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
            <div className="form-control mb-6">
              <div className="flex flex-col gap-2 mt-2">
                {/* QR Code Option */}
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr_code"
                    className="radio radio-primary mr-3"
                    checked={formData.paymentMethod === "qr_code"}
                    onChange={handleInputChange}
                  />
                  <FaQrcode className="w-6 h-6" />
                  <span className="ml-3">QR Code Payment</span>
                </label>

                {/* Credit Card Option */}
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    className="radio radio-primary mr-3"
                    checked={formData.paymentMethod === "credit_card"}
                    onChange={handleInputChange}
                  />
                  <FaCcMastercard className="w-6 h-6" />
                  <span className="ml-3">Credit Card Payment</span>
                </label>
              </div>
            </div>

            {/* Conditionally render credit card form fields */}
            {formData.paymentMethod === "credit_card" && (
              <>
                {/* Card Number */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Card Number</span>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Enter your card number"
                    className={`input input-bordered w-full ${
                      errors.cardNumber ? "input-error" : ""
                    }`}
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                  {errors.cardNumber && (
                    <p className="text-error mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Card Holder */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Card Holder</span>
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Card holder's name"
                    className={`input input-bordered w-full ${
                      errors.cardHolder ? "input-error" : ""
                    }`}
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                  />
                  {errors.cardHolder && (
                    <p className="text-error mt-1">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Expiry Date (MM/YY)</span>
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    className={`input input-bordered w-full ${
                      errors.expiryDate ? "input-error" : ""
                    }`}
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                  {errors.expiryDate && (
                    <p className="text-error mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                {/* CVV */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">CVV</span>
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    className={`input input-bordered w-full ${
                      errors.cvv ? "input-error" : ""
                    }`}
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                  {errors.cvv && (
                    <p className="text-error mt-1">{errors.cvv}</p>
                  )}
                </div>
              </>
            )}

            <h3 className="text-xl font-semibold mb-4">Delivery method</h3>
            <div className="form-control mb-6">
              <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    className="radio radio-primary mr-3"
                    checked={formData.shippingMethod === "standard"}
                    onChange={handleDeliveryChange}
                  />
                  <FaQrcode className="w-6 h-6" />
                  <span className="ml-3">Standard delivery</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    className="radio radio-primary mr-3"
                    checked={formData.shippingMethod === "express"}
                    onChange={handleDeliveryChange}
                  />
                  <FaCcMastercard className="w-6 h-6" />
                  <span className="ml-3">Express delivery</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-between mt-6">
              <p className="text-left">Subtotal:</p>
              <p className="text-right">${total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-left">Delivery fee:</p>
              <p className="text-right">${deliveryFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <p className="text-left">Total:</p>
              <p className="text-right">${totalTransaction.toFixed(2)}</p>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn btn-primary mt-6 w-full">
              Complete Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
