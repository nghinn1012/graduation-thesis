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
}

const CartItem: React.FC<CartItemType> = ({
  productInfo,
  onDecrement,
  onIncrement,
  onRemove,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const {setCurrentProduct } = useProductContext();
  if (!productInfo.productInfo) {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex-grow ml-4 opacity-50">
          <h3 className="font-semibold text-gray-400">Product not available</h3>
        </div>
        <p className="ml-4 text-red-500 font-semibold">No longer exists</p>
        <button
          className="p-2 ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
          onClick={() => onRemove(productInfo)}
        >
          <FaTrash size={16} />
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
  }

  return (
    <>
      <img
        src={productInfo.postInfo?.images?.[0] || "/placeholder-image.jpg"}
        alt={productInfo.postInfo?.title || "Product Image"}
        className="w-16 h-16 rounded-full object-cover"
        onClick={handleClick}
      />

      <div className="flex-grow ml-4">
        <h3 className="font-semibold truncate max-w-36" onClick={handleClick} >
          {productInfo.postInfo?.title || "Unknown Product"}
        </h3>

        <p className="text-gray-600">
          {formatPrice(productInfo.productInfo.price)}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded-lg px-2 py-1" style={{ width: "100px" }}>
          <button className="p-1" onClick={() => onDecrement(productInfo)}>
            <FaMinus size={12} />
          </button>
          <span className="mx-2 text-center" style={{ width: "30px" }}>
            {productInfo.quantity}
          </span>
          <button className="p-1" onClick={() => onIncrement(productInfo)}>
            <FaPlus size={12} />
          </button>
        </div>

        <p className="font-semibold" style={{ minWidth: "80px", textAlign: "right" }}>
          {formatPrice(productInfo.productInfo.price * productInfo.quantity)}
        </p>
      </div>

      <button
        className="p-2 ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
        onClick={() => onRemove(productInfo)}
      >
        <FaTrash size={16} />
      </button>
    </>
  );
};

export default CartItem;
