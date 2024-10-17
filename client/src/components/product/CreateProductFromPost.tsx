import React, { useState, useEffect } from 'react';
import { PostInfo } from '../../api/post';
import usePostContext from '../../hooks/usePostContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postId: string, price: number, quantity: number, timeToPrepare: number) => void;
  isSubmitting: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedPost, setSelectedPost] = useState<PostInfo | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [timeToPrepare, setTimeToPrepare] = useState<number>(0);
  const { posts } = usePostContext();

  useEffect(() => {
    if (selectedPost) {
      setPrice(selectedPost.product?.price || 0);
      setQuantity(selectedPost.product?.quantity || 0);
      setTimeToPrepare(selectedPost.product?.timeToPrepare || 0);
    } else {
      setPrice(0);
      setQuantity(0);
      setTimeToPrepare(0);
    }
  }, [selectedPost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost) {
      onSubmit(selectedPost._id, price, quantity, timeToPrepare);
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = posts.find(post => post._id === e.target.value);
    setSelectedPost(selected || null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Add Product Information
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Select Post</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedPost?._id || ''}
                  onChange={handlePostChange}
                >
                  <option value="">Select a post</option>
                  {posts.map((post) => (
                    <option key={post._id} value={post._id}>{post.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Price</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Time to Prepare (minutes)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={timeToPrepare}
                  onChange={(e) => setTimeToPrepare(Number(e.target.value))}
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !selectedPost}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
