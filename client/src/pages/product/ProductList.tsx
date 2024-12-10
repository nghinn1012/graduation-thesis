import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../../components/product/ProductCard";
import { useProductContext } from "../../context/ProductContext";
import { MdOutlineSearch } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { useI18nContext } from "../../hooks/useI18nContext";

const ProductListPage = () => {
  const { products, loading, page, setPage, totalPages, searchProducts,
    searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } =
    useProductContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("ProductSection");
  useEffect(() => {
    console.log(products);
  }, [products]);

  useEffect(() => {
    setPage(1);
    searchProducts(searchTerm, selectedCategory === "all" ? "" : selectedCategory);
  }, [selectedCategory]);

  function createPageArray() {
    const pages = [];
    const maxPagesToShow = 2;

    pages.push(page);

    if (page > 1) pages.unshift(page - 1);
    if (page < totalPages) pages.push(page + 1); 

    return pages;
  }


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    searchProducts(searchTerm, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const categories = [
      { name: "all", displayName: lang("categoryAll"), icon: "🍽" },
      { name: "breakfast", displayName: lang("categoryBreakfast"), icon: "🍳" },
      { name: "lunch", displayName: lang("categoryLunch"), icon: "🥪" },
      { name: "dinner", displayName: lang("categoryDinner"), icon: "🍝" },
      { name: "dessert", displayName: lang("categoryDessert"), icon: "🍰" },
      { name: "snack", displayName: lang("categorySnack"), icon: "🍪" },
      { name: "appetizer", displayName: lang("categoryAppetizer"), icon: "🥟" },
      { name: "drink", displayName: lang("categoryDrink"), icon: "🍹" },
      { name: "side", displayName: lang("categorySide"), icon: "🥗" }

  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="form-control">
          <div className="input-group flex flex-row">
            <input
              type="text"
              placeholder={lang("searchPlaceholder")}
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
        <h2 className="text-2xl font-bold mb-4">{lang("exploreCategories")}</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`btn btn-md py-2 ${
                selectedCategory == category.name ? "btn-accent" : ""
              }`}
            >
              <span className="">{category.icon}</span>
              {category.displayName}
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
        <p className="text-center text-lg">{lang("noProductsFound")}</p>
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
          {lang("previous")}
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
          {lang("next")}
        </button>
      </div>
    </div>
  );
};

export default ProductListPage;
