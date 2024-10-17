import React, { useState } from "react";
import {
  AiOutlineHeart,
  AiOutlineClockCircle,
  AiFillStar,
  AiOutlineLink,
} from "react-icons/ai";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

interface Ingredient {
  name: string;
  amount: string;
}

interface ProductPageProps {
  recipeId: string;
  title: string;
  description: string;
  price: number;
  preparationTime: number;
  images: string[];
  chef: {
    name: string;
    avatar: string;
  };
  ingredients: Ingredient[];
  hashtags: string[];
}

interface Topping {
  name: string;
  emoji: string;
}

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

const toppings: Topping[] = [
  { name: "Tomato", emoji: "🍅" },
  { name: "Lettuce", emoji: "🥬" },
  { name: "Onion", emoji: "🧅" },
  { name: "Strawberry", emoji: "🍓" },
];

const reviews: Review[] = [
  {
    id: 1,
    userName: "John Doe",
    userAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 5,
    comment: "Absolutely delicious! Will order again.",
    date: "2023-05-15",
  },
  {
    id: 2,
    userName: "Jane Smith",
    userAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 4,
    comment: "Great flavor, but a bit spicy for my taste.",
    date: "2023-05-10",
  },
];

const ProductPage: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const recipeData = (location.state as ProductPageProps) || {};
  const {
    recipeId = "", // default value
    title = "Default Recipe", // default value
    description = "No description available.", // default value
    price = 0, // default value
    preparationTime = 0, // default value
    images = ["default.jpg"], // default value
    chef = { name: "Unknown Chef", avatar: "default-avatar.jpg" }, // default value
    ingredients = [],
    hashtags = [],
  } = recipeData;

  const handleToppingToggle = (index: number): void => {
    setSelectedToppings((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const decreaseQuantity = (): void => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = (): void => {
    setQuantity((prev) => prev + 1);
  };

  const handleClickBack = (): void => {
    navigate(-1);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)]?.map((_, index) => (
      <AiFillStar
        key={index}
        className={index < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const handleRecipeLinkClick = () => {
    navigate(`/posts/${recipeId}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden h-screen overflow-y-auto">
        <div className="relative">
          <img
            src={images[0]}
            alt={title}
            className="w-full h-64 object-cover"
          />
          <button
            className="absolute top-2 left-2 bg-white rounded-full p-2"
            onClick={handleClickBack}
          >
            <IoChevronBackOutline className="w-6 h-6 text-gray-600" />
          </button>
          <button className="absolute top-2 right-2 bg-white rounded-full p-2">
            <AiOutlineHeart className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <div className="p-4">
          <a
            onClick={handleRecipeLinkClick}
            className="flex items-center text-blue-600 hover:underline mt-4 cursor-pointer"
          >
            <AiOutlineLink className="w-5 h-5 mr-2" /> 

            <span className="font-bold">{` ${title}`}</span>.
          </a>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="font-bold">5.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={decreaseQuantity}
              >
                <FiMinus className="w-4 h-4 text-white" />
              </button>
              <span className="font-bold">
                {quantity.toString().padStart(2, "0")}
              </span>
              <button
                className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={increaseQuantity}
              >
                <FiPlus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">{title}</h2>
          <div className="flex items-center text-gray-500 mb-4">
            <AiOutlineClockCircle className="w-4 h-4 mr-1" />
            <span>{preparationTime} mins</span>
          </div>
          <p className="text-gray-600 my-4">{description}</p>

          <div className="my-4">
            <h3 className="font-bold mb-2">
              Ingredients:
              <span className="text-gray-600 font-normal">
                {" " +
                  ingredients.map((ingredient) => ingredient.name).join(", ")}
              </span>
            </h3>
          </div>

          <div className="my-4">
            <div className="flex flex-wrap gap-2">
              {hashtags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Total Price</span>
              <span className="font-bold text-xl">${price * quantity}</span>
            </div>

            <div className="flex justify-center">
              <button className="w-48 bg-black text-white py-3 rounded-lg font-bold">
                Go To Cart
              </button>
            </div>
          </div>

          <div className="my-6">
            <h3 className="font-bold text-xl mb-4">Reviews</h3>
            {reviews.map((review) => (
              <div key={review.id} className="mb-4 border-b pb-4">
                <div className="flex items-center mb-2">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
