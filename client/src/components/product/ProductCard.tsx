import React from "react";
import { useNavigate } from "react-router-dom";
import { ProductInfo } from "../../api/post";

interface ProductCardProps {
  product: ProductInfo;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleClickImage = () => {
    navigate(`/posts/productDetails/${product?._id}`, {
      state: {
        recipeId: product?.postInfo?._id,
        _id: product?._id,
        title: product.postInfo.title,
        description: product.postInfo?.about,
        quantity: product?.quantity,
        price: product?.price,
        preparationTime: product?.timeToPrepare,
        images: product.postInfo.images,
        chef: {
          name: "",
          avatar: "post.author.avatar",
        },
        ingredients: product.postInfo.ingredients,
        hashtags: product.postInfo.hashtags,
      },
    });
  };

  return (
    <div className="card w-full shadow-md rounded-lg relative overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <figure className="relative">
        <img
          src={product.postInfo.images[0]}
          alt={product.postInfo.title}
          onClick={handleClickImage}
          className="w-full h-48 object-cover"
        />
        {/* {discount && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {discount} OFF
          </span>
        )} */}
      </figure>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Title */}
        <h2 className="text-md font-semibold mb-2">{product.postInfo.title}</h2>

        {/* Price and Type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(product.price.toString())}
          </span>
          <span className={`flex items-center text-sm text-green-500`}>
            {product.postInfo.course && (
              <span className="mr-2">{product.postInfo.course}</span>
            )}
          </span>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Button Group */}
        <div className="mt-4">
          {/* Add to Cart Button */}
          <button className="btn btn-neutral flex items-center justify-center w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
