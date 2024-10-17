import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CartItem: React.FC<CartItemType & {
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}> = ({ id, name, price, quantity, image, onIncrement, onDecrement }) => (
  <div className="flex items-center justify-between mb-4">
    <img src={image} alt={name} className="w-24 h-24 rounded-full object-cover" />
    <div className="flex-grow ml-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-600">${price.toFixed(2)}</p>
    </div>
    <div className="flex items-center">
      <button className="p-1 bg-gray-200 rounded-full" onClick={() => onDecrement(id)}>
        <FaMinus size={12} />
      </button>
      <span className="mx-2">{quantity.toString().padStart(2, '0')}</span>
      <button className="p-1 bg-gray-200 rounded-full" onClick={() => onIncrement(id)}>
        <FaPlus size={12} />
      </button>
    </div>
    <p className="ml-4 font-semibold">${(price * quantity).toFixed(2)}</p>
  </div>
);

const Cart: React.FC = () => {
  const initialItems: CartItemType[] = [
    { id: '1', name: 'Áo thun', price: 19.99, quantity: 2, image: 'https://example.com/tshirt.jpg' },
    { id: '2', name: 'Quần jeans', price: 49.99, quantity: 1, image: 'https://example.com/jeans.jpg' },
    { id: '3', name: 'Giày sneaker', price: 79.99, quantity: 1, image: 'https://example.com/sneakers.jpg' },
  ];

  const [items, setItems] = useState<CartItemType[]>(initialItems);
  const [promoCode, setPromoCode] = useState<string>('');

  const handleIncrement = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // Implement checkout logic here
  };

  const handleApplyPromo = () => {
    console.log(`Applying promo code: ${promoCode}`);
    // Implement promo code logic here
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 3.50;
  const total = subtotal + delivery;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button className="text-2xl">&lt;</button>
        <h2 className="text-2xl font-bold">Cart</h2>
        <button className="text-2xl">&times;</button>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <CartItem
            key={item.id}
            {...item}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        ))}
      </div>

      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Promo Code"
          className="flex-grow p-2 border rounded-l-lg"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-r-lg"
          onClick={handleApplyPromo}
        >
          Apply
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>${delivery.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="w-full bg-green-500 text-white py-3 rounded-lg font-bold"
        onClick={handleCheckout}
      >
        CHECKOUT
      </button>
    </div>
  );
};

export default Cart;
