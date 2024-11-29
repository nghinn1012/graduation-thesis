import React from "react";
import { useNavigate } from "react-router-dom";
import { ProductInfo } from "../../api/post";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useProductContext } from "../../context/ProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";
import { useI18nContext } from "../../hooks/useI18nContext";

interface ProductCardProps {
  product: ProductInfo;
  rating: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rating }) => {
  const navigate = useNavigate();
  const { addProductToCart, setCurrentProduct, cart, alreadyAddToCart } = useProductContext();
  const { account } = useAuthContext();
  const { success, error } = useToastContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("ProductSection");
  const langCode = languageContext.language.code;

  const formatPrice = (price: string | number) => {
    const num = parseFloat(price.toString());
    if (isNaN(num)) return "N/A";

    const locales = {
      en: "en-US",
      vi: "vi-VN",
    };

    const currencies = {
      en: "USD",
      vi: "VND",
    };

    const locale = locales[langCode] || "en-US";
    const currency = currencies[langCode] || "USD";

    if (Number.isInteger(num)) {
      return num.toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      });
    } else {
      return num.toLocaleString(locale, {
        style: "currency",
        currency,
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
        {Array(fullStars)?.fill(<FaStar className="text-yellow-500" />)}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" />}
        {Array(emptyStars)?.fill(<FaRegStar className="text-yellow-500" />)}
      </div>
    );
  };

  const isMaximumQuantityInCart = () => {
    const existingCartItem = cart.find(item => item.productId === product._id);
    if (!existingCartItem) return false;
    return existingCartItem.quantity >= (product.quantity || 0);
  };

  const getAddToCartButtonText = () => {
    if (product.quantity <= 0) return lang("out-of-stock");
    if (isMaximumQuantityInCart()) return lang("maximum-in-cart");
    return lang("add-to-cart");
  };

  const handleAddToCart = (productId: string) => {
    const existingCartItem = cart.find(item => item.productId === productId);
    const availableQuantity = product.quantity || 0;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + 1;
      if (newQuantity > availableQuantity) {
        error(lang("maximum-in-cart"));
        return;
      }
    } else {
      if (availableQuantity < 1) {
        error(lang("sorry-out-of-stock"));
        return;
      }
    }

    addProductToCart(productId, 1);
    success(lang("added-to-cart"));
  };

  return (
    <div className="card w-full shadow-md rounded-lg relative overflow-hidden flex flex-col h-[90%]">
      <figure className="relative">
        <img
          src={product.postInfo.images[0]}
          alt={product.postInfo.title}
          onClick={handleClickImage}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </figure>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-md font-semibold mb-2 truncate max-w-36">
          {product.postInfo.title}
        </h2>

        <div className="flex items-center mb-2">
          {renderStars(rating)}
          <span className="ml-2 text-sm text-gray-600">
            ({rating.toFixed(1)})
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-600">
            {lang("available")}: {product.quantity}
          </span>
        </div>

        <div className="flex-grow"></div>

        <div className="mt-4">
          {account?._id !== (product.postInfo.author as unknown as string) && (
            <button
              className={`btn btn-neutral flex items-center justify-center w-full ${
                (product.quantity <= 0 || isMaximumQuantityInCart()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handleAddToCart(product._id)}
              disabled={product.quantity <= 0 || isMaximumQuantityInCart() || alreadyAddToCart}
            >
              <AiOutlineShoppingCart className="w-5 h-5 mr-2" />
              {getAddToCartButtonText()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
