import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { ReviewCreate } from "../../api/post";
import { IoMdClose } from "react-icons/io";
import { useI18nContext } from "../../hooks/useI18nContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviews: ReviewCreate[]) => Promise<void>;
  orderId: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderId,
}) => {
  const { currentOrderReview, setCurrentOrderReview, fetchOrderById, loading } = useProductContext();
  const [reviews, setReviews] = useState<ReviewCreate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const language = useI18nContext();
  const lang = language.of("ReviewSection");

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
        review: "",
      }));
      setReviews(initialReviews);
    }
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
        review.productId === productId ? { ...review, review: comment } : review
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(reviews);
      onClose();
    } catch (error) {
      console.error("Error submitting reviews:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOrderReview?.products) {
    return null;
  }

  return (
    <dialog className={`modal modal-bottom sm:modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          <IoMdClose className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">{lang("review-products")}</h3>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : (
            currentOrderReview.products.map((item) => {
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
                        value={review?.review}
                        onChange={(e) =>
                          handleCommentChange(product.productInfo._id, e.target.value)
                        }
                        placeholder={lang("review-placeholder")}
                        className="textarea textarea-bordered w-full"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            {lang("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                {lang("submitting")}
              </>
            ) : (
              lang("submit-review")
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button className="cursor-default">close</button>
      </div>
    </dialog>
  );
};

export default ReviewModal;
