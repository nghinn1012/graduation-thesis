import React, { useEffect, useState } from "react";
import {
  AiOutlineHeart,
  AiOutlineClockCircle,
  AiFillStar,
  AiOutlineLink,
} from "react-icons/ai";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductContext } from "../../context/ProductContext";
import { Review } from "../../api/post";
import PurchaseSkeleton from "../../components/skeleton/PurchaseSkeleton";
import { useAuthContext } from "../../hooks/useAuthContext";

interface Ingredient {
  name: string;
  amount: string;
}

interface ProductPageProps {
  _id: string;
  recipeId: string;
}

interface Topping {
  name: string;
  emoji: string;
}

const toppings: Topping[] = [
  { name: "Tomato", emoji: "🍅" },
  { name: "Lettuce", emoji: "🥬" },
  { name: "Onion", emoji: "🧅" },
  { name: "Strawberry", emoji: "🍓" },
];

const ProductPage: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const { addProductToCart, currentProduct, fetchProductByPostId, loading, cart } =
    useProductContext();

  const recipeData = (location.state as ProductPageProps) || {};
  const {account} = useAuthContext();

  const getCurrentCartQuantity = () => {
    const cartItem = cart?.find((item) => item.productId === recipeData._id);
    return cartItem?.quantity || 0;
  };

  const getRemainingQuantity = () => {
    const cartQuantity = getCurrentCartQuantity();
    return currentProduct?.quantity ? currentProduct.quantity - cartQuantity : 0;
  };

  useEffect(() => {
    fetchProductByPostId(recipeData.recipeId);
  }, [recipeData.recipeId]);

  const handleToppingToggle = (index: number): void => {
    setSelectedToppings((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const decreaseQuantity = (): void => {
    setQuantity((prev) => Math.max(1, prev - 1));
    setError("");
  };

  const increaseQuantity = (): void => {
    const remainingQuantity = getRemainingQuantity();

    if (quantity >= remainingQuantity) {
      setError(`Cannot exceed available quantity (${remainingQuantity} remaining)`);
      return;
    }
    setQuantity((prev) => prev + 1);
    setError("");
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
    navigate(`/posts/${recipeData.recipeId}`);
  };

  const handleAddToCart = (productId: string) => {
    const remainingQuantity = getRemainingQuantity();
    const cartQuantity = getCurrentCartQuantity();

    if (!currentProduct?.quantity) {
      setError("Product is out of stock");
      return;
    }

    if (remainingQuantity === 0) {
      setError("Maximum quantity already in cart");
      return;
    }

    if (quantity > remainingQuantity) {
      setError(`Cannot add more than ${remainingQuantity} items (${cartQuantity} already in cart)`);
      return;
    }

    console.log(`Adding product to cart: ${productId}`);
    addProductToCart(productId, quantity);
  };

  const remainingQuantity = getRemainingQuantity();
  const cartQuantity = getCurrentCartQuantity();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden h-screen overflow-y-auto">
        {loading ? (
          <PurchaseSkeleton />
        ) : (
          <>
            <div className="relative">
              <img
                src={currentProduct?.postInfo.images[0]}
                alt={currentProduct?.postInfo.title}
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
                <span className="font-bold">{` ${currentProduct?.postInfo.title}`}</span>
                .
              </a>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-bold">{currentProduct?.averageRating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="btn btn-circle btn-sm bg-yellow-400 border-none hover:bg-yellow-500"
                    onClick={decreaseQuantity}
                  >
                    <FiMinus className="w-4 h-4 text-white" />
                  </button>
                  <span className="font-bold">
                    {quantity.toString().padStart(2, "0")}
                  </span>
                  <button
                    className="btn btn-circle btn-sm bg-yellow-400 border-none hover:bg-yellow-500"
                    onClick={increaseQuantity}
                    disabled={remainingQuantity === 0 || quantity >= remainingQuantity}
                  >
                    <FiPlus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Available Items Display */}
              <div className="mb-4 space-y-1">
                <div className="text-sm text-gray-600">
                  Total Available: {currentProduct?.quantity || 0} items
                </div>
                {cartQuantity > 0 && (
                  <div className="text-sm text-blue-600">
                    In Your Cart: {cartQuantity} items
                  </div>
                )}
                <div className="text-sm text-green-600">
                  Remaining: {remainingQuantity} items
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <h2 className="text-xl font-bold mb-1">
                {currentProduct?.postInfo.title}
              </h2>
              <div className="flex items-center text-gray-500 mb-4">
                <AiOutlineClockCircle className="w-4 h-4 mr-1" />
                <span>{currentProduct?.timeToPrepare} mins</span>
              </div>
              <p className="text-gray-600 my-4">
                {currentProduct?.postInfo.about}
              </p>

              <div className="my-4">
                <h3 className="font-bold mb-2">
                  Ingredients:
                  <span className="text-gray-600 font-normal">
                    {" " +
                      currentProduct?.postInfo.ingredients
                        .map((ingredient) => ingredient.name)
                        .join(", ")}
                  </span>
                </h3>
              </div>

              <div className="my-4">
                <div className="flex flex-wrap gap-2">
                  {currentProduct?.postInfo.hashtags?.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total Price</span>
                  <span className="font-bold text-xl">
                    ${currentProduct?.price ? currentProduct?.price * quantity || 0 : 0}
                  </span>
                </div>

                <div className="flex justify-center">
                  {account?._id !== currentProduct?.postInfo.author && (
                    <button
                      className={`btn ${
                        remainingQuantity === 0
                          ? "btn-disabled"
                          : "btn-primary"
                      } w-48`}
                      onClick={() => handleAddToCart(recipeData._id)}
                      disabled={remainingQuantity === 0}
                    >
                      {remainingQuantity > 0 ? "Add To Cart" : "Maximum In Cart"}
                    </button>
                  )}
                </div>
              </div>

              <div className="my-6">
                <h3 className="font-bold text-xl mb-4">Reviews</h3>
                {currentProduct?.reviews.map((review) => (
                  <div className="mb-4 border-b pb-4">
                    <div className="flex items-center mb-2">
                      <img
                        src={
                          review.author.avatar ||
                          "https://www.gravatar.com/avatar/"
                        }
                        alt={""}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-semibold">{review.author.name}</p>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-500">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
