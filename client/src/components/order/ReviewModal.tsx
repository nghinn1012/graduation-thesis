import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviews: OrderReview[]) => void;
  orderId: string;
}

interface OrderReview {
  productId: string;
  rating: number;
  comment: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderId,
}) => {
  const { currentOrderReview, setCurrentOrderReview, fetchOrderById, loading } = useProductContext();
  const [reviews, setReviews] = useState<OrderReview[]>([]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, isOpen]);

  useEffect(() => {
    if (currentOrderReview?.products) {
      const initialReviews = currentOrderReview.products.map((product) => ({
        productId: product.productInfo._id,
        rating: 5,
        comment: "",
      }));
      setReviews(initialReviews);
    }
    console.log(currentOrderReview);
  }, [currentOrderReview]);

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.productId === productId ? { ...review, rating } : review
      )
    );
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.productId === productId ? { ...review, comment } : review
      )
    );
  };

  const handleSubmit = () => {
    onSubmit(reviews);
    onClose();
  };

  if (!currentOrderReview?.products) {
    return null;
  }

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">Review Products</h3>

        <div className="space-y-6">
          {loading ? "Loading" : currentOrderReview.products.map((item) => {
            const review = reviews.find((r) => r.productId === item.productInfo._id)!;
            const product = item;

            return (
              <div key={product.productInfo._id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={product?.postInfo?.images[0]}
                    alt={product?.postInfo?.title}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{product?.postInfo?.title}</h4>

                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(product.productInfo._id, star)}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          <span
                            className={
                              star <= review?.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={review?.comment}
                      onChange={(e) =>
                        handleCommentChange(product.productId, e.target.value)
                      }
                      placeholder="Write your review here..."
                      className="textarea textarea-bordered w-full"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-primary btn-sm">
            Submit Reviews
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ReviewModal;
