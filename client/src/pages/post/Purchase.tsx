import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

interface OrderDishPageProps {
  recipeId: string;
  title: string;
  description: string;
  price: number;
  preparationTime: string;
  image?: string;
  chef: {
    name: string;
    avatar?: string;
    rating: number;
  };
}

const OrderDishPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    recipeId,
    title,
    description,
    price,
    preparationTime,
    image,
    chef
  } = location.state as OrderDishPageProps;

  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const totalPrice = price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleOrder = () => {
    console.log('Order placed', {
      recipeId,
      quantity,
      specialRequests,
      totalPrice
    });
  };

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-300 min-h-screen">
      <div className="p-4 border-b border-gray-300 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
          <IoArrowBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Order Dish</h1>
      </div>

      <div className="p-4">
        <div className="card bg-base-100 shadow-xl">
          {image && (
            <figure>
              <img src={image} alt={title} className="w-full h-48 object-cover" />
            </figure>
          )}
          <div className="card-body">
            <h2 className="card-title">{title}</h2>
            <p className="text-gray-600">{description}</p>

            <div className="flex items-center mt-4">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={chef.avatar || "/avatar-placeholder.png"} alt={chef.name} />
                </div>
              </div>
              <div className="ml-3">
                <p className="font-semibold">{chef.name}</p>
                <div className="rating rating-sm">
                  {[...Array(5)].map((_, i) => (
                    <input
                      key={i}
                      type="radio"
                      name="rating-2"
                      className={`mask mask-star-2 ${i < chef.rating ? 'bg-orange-400' : 'bg-gray-300'}`}
                      disabled
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="flex justify-between items-center">
              <span className="font-bold">Price per serving:</span>
              <span className="text-success font-bold">${price.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="font-bold">Preparation time:</span>
              <span>{preparationTime}</span>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-bold">Quantity</span>
              </label>
              <div className="flex items-center">
                <button
                  className="btn btn-square btn-sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <span className="mx-4 font-bold">{quantity}</span>
                <button
                  className="btn btn-square btn-sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-bold">Special requests</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Any special requests? (allergies, preferences, etc.)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              ></textarea>
            </div>

            <div className="divider"></div>

            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span className="text-success">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary" onClick={handleOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDishPage;
