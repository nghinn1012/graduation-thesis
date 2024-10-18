import React, { useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import { ProductInfo } from "../../api/post";
import { useProductContext } from "../../context/ProductContext";

const Skeleton = () => (
  <div className="animate-pulse p-4">
    <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-6 bg-gray-300 rounded mb-2"></div>
    <div className="h-6 bg-gray-300 rounded mb-2"></div>
    <div className="h-6 bg-gray-300 rounded mb-4"></div>
  </div>
);

const ProductListPage: React.FC = () => {
  const { products, loading, error, page, setPage, totalPages } = useProductContext();

  useEffect(() => {
    // Fetch products
    console.log(products);
  }, [products]);

  // Tạo mảng số trang
  const createPageArray = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-6 min-h-screen"> {/* Add min-h-screen */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-screen-xl">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      )}
      {error && <p>{error}</p>}

      {/* Product Grid */}
      {!loading && products.length === 0 && <p>No products found.</p>}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-screen-xl">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              rating={product.averageRating}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls with DaisyUI */}
      <div className="join mt-8 fixed bottom-0 left-[50%] right-0 bg-white p-2">
        <button
          onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
          className="join-item btn"
          disabled={page === 1}
        >
          Previous
        </button>

        {/* Dãy trang */}
        {createPageArray().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`join-item btn ${page === pageNumber ? "btn-active" : ""}`}
            disabled={totalPages === 1} // Disable if there's only one page
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages))}
          className="join-item btn"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListPage;
