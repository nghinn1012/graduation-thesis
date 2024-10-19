import React, { useEffect, useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { useNavigate } from 'react-router-dom';

const OrderInfoPage = () => {
  const { cart, selectedItems } = useProductContext();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const selectedProducts = cart.filter(item => selectedItems.includes(item._id));
  const total = selectedProducts.reduce((sum, item) => sum + (item.productInfo?.price || 0) * item.quantity, 0);
  const delivery = 3.5;
  const totalTransaction = total + delivery;

  const handleProcessPayment = () => {
    console.log('Processing payment...');
  };

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate('/cart');
    }
  }, [selectedProducts]);

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="mx-auto bg-base-100 rounded-box shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

          {/* Selected Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Selected Items</h3>
            <ul className="space-y-2">
              {selectedProducts.map(item => (
                <li key={item._id} className="flex justify-between">
                  <span>{item.postInfo?.title}</span>
                  <span>${(item.productInfo?.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Note */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Order Note</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Add a note to your order"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          {/* Address Dropdown */}
          <div className="form-control mb-6">
            <label
              className="label cursor-pointer"
              onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
            >
              <span className="label-text">Delivery Address</span>
              <span className="label-text-alt">{isAddressDropdownOpen ? '▲' : '▼'}</span>
            </label>
            {isAddressDropdownOpen && (
              <input
                type="text"
                placeholder="Enter your delivery address"
                className="input input-bordered w-full"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}
          </div>

          {/* Payment Method Dropdown */}
          <div className="form-control mb-6">
            <label
              className="label cursor-pointer"
              onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
            >
              <span className="label-text">Payment Method</span>
              <span className="label-text-alt">{isPaymentDropdownOpen ? '▲' : '▼'}</span>
            </label>
            {isPaymentDropdownOpen && (
              <div className="space-y-2">
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="radio radio-primary"
                    value="QR Code"
                    checked={paymentMethod === 'QR Code'}
                    onChange={() => setPaymentMethod('QR Code')}
                  />
                  <span className="ml-2">QR Code</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="radio radio-primary"
                    value="Cash"
                    checked={paymentMethod === 'Cash'}
                    onChange={() => setPaymentMethod('Cash')}
                  />
                  <span className="ml-2">Cash</span>
                </label>
              </div>
            )}
          </div>

          {/* Total Transaction */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Total transaction</h3>
            <p className="text-2xl font-bold">${totalTransaction.toFixed(2)}</p>
          </div>

          {/* Process Payment Button */}
          <button
            className="btn btn-warning btn-block"
            onClick={handleProcessPayment}
          >
            PROCESS PAYMENT
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
