import React, { useEffect, useState } from "react";
import CartItem from "../../components/product/CartItem";
import { useProductContext } from "../../context/ProductContext";
import { ProductCart } from "../../api/post";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const {
    cart,
    addProductToCart,
    removeProductFromCart,
    selectedItems,
    setSelectedItems,
  } = useProductContext();
  const [items, setItems] = useState<ProductCart[]>(cart);
  const [promoCode, setPromoCode] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [authorSelections, setAuthorSelections] = useState<{
    [authorId: string]: boolean;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    setItems(cart);
    setSelectedItems([]);
    setSelectAll(false);
    setAuthorSelections({});
  }, [cart]);

  const handleIncrement = (item: ProductCart) => {
    addProductToCart(item.productId, 1);
  };

  const handleDecrement = (item: ProductCart) => {
    if (item.quantity === 1) {
      const confirmRemove = window.confirm(
        "Quantity is 1. Do you want to remove this item from the cart?"
      );
      if (confirmRemove) {
        removeProductFromCart([item.productId]);
      }
    } else {
      addProductToCart(item.productId, -1);
    }
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout");
    navigate("/checkout");
  };

  const handleApplyPromo = () => {
    console.log(`Applying promo code: ${promoCode}`);
  };

  const handleRemove = (productId: string) => {
    removeProductFromCart([productId]);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allItemIds = items.map((item) => item._id);
      setSelectedItems(allItemIds);
      const newAuthorSelections: { [authorId: string]: boolean } = {};
      Object.keys(groupItemsByAuthor(items)).forEach((authorId) => {
        newAuthorSelections[authorId] = true;
      });
      setAuthorSelections(newAuthorSelections);
    } else {
      setSelectedItems([]);
      setAuthorSelections({});
    }
  };

  const handleSelectAuthor = (authorId: string, isSelected: boolean) => {
    const newAuthorSelections = {
      ...authorSelections,
      [authorId]: !isSelected,
    };
    setAuthorSelections(newAuthorSelections);

    const authorItems = groupedItems[authorId].map((item) => item._id);
    if (!isSelected) {
      setSelectedItems([...selectedItems, ...authorItems]);
    } else {
      setSelectedItems(
        selectedItems.filter((itemId) => !authorItems.includes(itemId))
      );
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

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

  const groupItemsByAuthor = (items: ProductCart[]) => {
    const groupedItems: { [authorId: string]: ProductCart[] } = {};
    items.forEach((item) => {
      const authorId = item?.author?._id || "unknown";
      if (!groupedItems[authorId]) {
        groupedItems[authorId] = [];
      }
      groupedItems[authorId].push(item);
    });
    return groupedItems;
  };

  const groupedItems = groupItemsByAuthor(items);

  const subtotal = items
    .filter((item) => selectedItems.includes(item._id))
    .reduce(
      (sum, item) => sum + (item.productInfo?.price || 0) * item.quantity,
      0
    );

  const total = subtotal;

  useEffect(() => {
    setSelectAll(items.length > 0 && selectedItems.length === items.length);

    const newAuthorSelections: { [authorId: string]: boolean } = {};
    Object.keys(groupItemsByAuthor(items)).forEach((authorId) => {
      const authorItems = groupedItems[authorId];
      const allSelected = authorItems.every((item) =>
        selectedItems.includes(item._id)
      );
      newAuthorSelections[authorId] = allSelected;
    });
    setAuthorSelections(newAuthorSelections);
  }, [selectedItems, items]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cart</h2>
        {selectedItems.length > 0 && (
          <input
            type="checkbox"
            className="checkbox checkbox-info"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        )}
      </div>

      <div className="space-y-4 mb-6">
        {Object.keys(groupedItems).length > 0 ? (
          Object.keys(groupedItems).map((authorId) => (
            <div key={authorId} className="mb-8">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="mr-4 checkbox checkbox-info"
                  checked={authorSelections[authorId] || false}
                  onChange={() =>
                    handleSelectAuthor(
                      authorId,
                      authorSelections[authorId] || false
                    )
                  }
                />
                <h3 className="text-lg font-semibold">
                  {groupedItems[authorId][0]?.author?.name || "Unknown Author"}
                </h3>
              </div>

              {groupedItems[authorId].map((item) => (
                <div
                  key={item._id}
                  className={`p-4 border rounded-lg my-2 ${
                    !item.productInfo ? "opacity-50" : ""
                  }`}
                >
                  {item.productInfo ? (
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-info mr-4"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                      />
                      <CartItem
                        key={item._id}
                        productInfo={item}
                        onIncrement={() => handleIncrement(item)}
                        onDecrement={() => handleDecrement(item)}
                        onRemove={() => handleRemove(item.productId)}
                        formatPrice={formatPrice}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-red-500 text-sm mb-2">
                        This product no longer exists.
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <CartItem
                          key={item._id}
                          productInfo={item}
                          onIncrement={() => handleIncrement(item)}
                          onDecrement={() => handleDecrement(item)}
                          onRemove={() => handleRemove(item.productId)}
                          formatPrice={formatPrice}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button
        className="w-full bg-green-500 text-white py-3 rounded-lg font-bold"
        onClick={handleCheckout}
      >
        CHECKOUT
      </button>
    </div>
  );
};

export default CartPage;
