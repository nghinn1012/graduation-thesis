import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../../components/product/ProductCard";
import { useProductContext } from "../../context/ProductContext";
import { MdOutlineSearch } from "react-icons/md";
import { useLocation } from "react-router-dom";

const categories = [
  { name: "all", icon: "🍽" },
  { name: "breakfast", icon: "🍳" },
  { name: "lunch", icon: "🥪" },
  { name: "dinner", icon: "🍝" },
  { name: "dessert", icon: "🍰" },
  { name: "snack", icon: "🍪" },
  { name: "appetizer", icon: "🥟" },
  { name: "drink", icon: "🍹" },
  { name: "side", icon: "🥗" },
];

const ProductListPage = () => {
  const { products, loading, page, setPage, totalPages, searchProducts,
    searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } =
    useProductContext();
  useEffect(() => {
    console.log(products);
  }, [products]);

  useEffect(() => {
    setPage(1);
    searchProducts(searchTerm, selectedCategory === "all" ? "" : selectedCategory);
  }, [selectedCategory]);

  const createPageArray = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    searchProducts(searchTerm, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="form-control">
          <div className="input-group flex flex-row">
            <input
              type="text"
              placeholder="Search food"
              className="input input-bordered flex-grow"
              value={searchTerm}
              defaultValue={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-square btn-primary">
              <MdOutlineSearch className="w-6 h-6" />
            </button>
          </div>
        </div>
      </form>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Explore Categories</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`btn btn-md py-2 ${
                selectedCategory === category.name ? "btn-accent" : ""
              }`}
            >
              <span className="">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="skeleton h-64 w-full"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-lg">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              rating={product.averageRating || 0}
            />
          ))}
        </div>
      )}

      <div className="join mt-8 flex justify-center">
        <button
          onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          className="join-item btn"
          disabled={page === 1}
        >
          Previous
        </button>

        {createPageArray().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`join-item btn ${
              page === pageNumber ? "btn-active" : ""
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() =>
            setPage((prevPage) => Math.min(prevPage + 1, totalPages))
          }
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
