import React from "react";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { ProductCart } from "../../api/post";
import { useNavigate } from "react-router-dom";
import { useProductContext } from "../../context/ProductContext";

interface CartItemType {
  productInfo: ProductCart;
  onDecrement: (item: ProductCart) => void;
  onIncrement: (item: ProductCart) => void;
  onRemove: (item: ProductCart) => void;
  formatPrice: (price: string | number) => string;
  maxQuantity: number;
  alreadyAddToCart: boolean;
}

const CartItem: React.FC<CartItemType> = ({
  productInfo,
  onDecrement,
  onIncrement,
  onRemove,
  formatPrice,
  maxQuantity,
  alreadyAddToCart,
}) => {
  const navigate = useNavigate();
  const { setCurrentProduct } = useProductContext();

  if (!productInfo.productInfo) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex-grow opacity-50">
          <h3 className="font-semibold text-gray-400">Product not available</h3>
        </div>
        <p className="ml-2 text-red-500 font-semibold text-sm">
          No longer exists
        </p>
        <button
          className="p-1.5 ml-2 text-red-500 hover:bg-red-50 rounded-full"
          onClick={() => onRemove(productInfo)}
        >
          <FaTrash size={14} />
        </button>
      </div>
    );
  }

  const handleClick = () => {
    setCurrentProduct(null);
    navigate(`/posts/productDetails/${productInfo.productId}`, {
      state: {
        recipeId: productInfo?.postInfo?._id,
        _id: productInfo?._id,
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <img
          src={productInfo.postInfo?.images?.[0] || "/placeholder-image.jpg"}
          alt={productInfo.postInfo?.title || "Product Image"}
          className="w-12 h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
          onClick={handleClick}
        />

        <div className="min-w-0 flex-grow">
          <h3
            className="font-medium text-sm truncate cursor-pointer"
            onClick={handleClick}
          >
            {productInfo.postInfo?.title || "Unknown Product"}
          </h3>
          <p className="text-gray-600 text-sm">
            {formatPrice(productInfo.productInfo.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
        <div className="flex items-center border rounded px-2 py-1">
          <button
            className={`p-1`}
            onClick={() => onDecrement(productInfo)}
            disabled={alreadyAddToCart}
          >
            <FaMinus size={12} />
          </button>
          <span className="mx-3 text-sm min-w-[20px] text-center">
            {productInfo.quantity}
          </span>
          <button
            className={`p-1 ${
              productInfo.quantity >= maxQuantity
                ? "bg-gray-300 text-gray-500"
                : "bg-white text-black"
            }`}
            onClick={() => onIncrement(productInfo)}
            disabled={productInfo.quantity >= maxQuantity || alreadyAddToCart}
          >
            <FaPlus size={12} />
          </button>
        </div>

        <p className="font-medium text-sm whitespace-nowrap ml-auto sm:ml-0 w-8 mx-2">
          {formatPrice(productInfo.productInfo.price * productInfo.quantity)}
        </p>

        <button
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full ml-auto sm:ml-0"
          onClick={() => onRemove(productInfo)}
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
