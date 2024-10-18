import React from "react";
import { useNavigate } from "react-router-dom";
import { ProductInfo } from "../../api/post";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useProductContext } from "../../context/ProductContext";

interface ProductCardProps {
  product: ProductInfo;
  rating: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rating }) => {
  const navigate = useNavigate();
  const {addProductToCart, setCurrentProduct} = useProductContext();

  const formatPrice = (price: string | number) => {
    const num = parseFloat(price.toString());
    if (isNaN(num)) return "N/A";

    if (Number.isInteger(num)) {
      return num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      });
    } else {
      return num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const handleClickImage = () => {
    setCurrentProduct(null);
    navigate(`/posts/productDetails/${product?._id}`, {
      state: {
        recipeId: product?.postInfo?._id,
        _id: product?._id,
      },
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {Array(fullStars).fill(<FaStar className="text-yellow-500" />)} {/* Full Stars */}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" />} {/* Half Star */}
        {Array(emptyStars).fill(<FaRegStar className="text-yellow-500" />)} {/* Empty Stars */}
      </div>
    );
  };

  const handleAddToCart = (productId: string) => {
    addProductToCart(productId, 1);
  };

  return (
    <div className="card w-full shadow-md rounded-lg relative overflow-hidden flex flex-col h-[95%]">
      {/* Image Section */}
      <figure className="relative">
        <img
          src={product.postInfo.images[0]}
          alt={product.postInfo.title}
          onClick={handleClickImage}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </figure>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Title */}
        <h2 className="text-md font-semibold mb-2 truncate max-w-36">{product.postInfo.title}</h2>

        {/* Rating */}
        <div className="flex items-center mb-2">
          {renderStars(rating)}
          <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span> {/* Show rating number */}
        </div>

        {/* Price and Type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Button Group */}
        <div className="mt-4">
          {/* Add to Cart Button */}
          <button className="btn btn-neutral flex items-center justify-center w-full"
          onClick={() => handleAddToCart(product._id)}>
            <AiOutlineShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
