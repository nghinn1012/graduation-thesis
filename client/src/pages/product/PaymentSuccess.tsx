import React from 'react';
import { useLocation } from 'react-router-dom';

interface OrderInfo {
  orderNumber: string;
  totalAmount: number;
  deliveryAddress: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const orders: OrderInfo[] = location.state.orderResults || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Payment successfully!</h1>
      <p className="text-center mb-4">Thank you for your order! This is your order information:</p>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="border rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold">Order #{order.orderNumber}</h2>
              <p><strong>Total transaction:</strong> {order.totalAmount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}</p>
              <p><strong>Address: </strong> {order.deliveryAddress}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-500">No order information</p>
      )}

      <div className="text-center mt-6">
        <a href="/" className="btn btn-primary">Back to home</a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
