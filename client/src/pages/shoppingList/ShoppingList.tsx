import React, { useEffect, useState } from "react";
import {
  IngredientOfList,
  ingredientOfListSchema,
  postFetcher,
  ShoppingListData,
} from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FiMoreVertical } from "react-icons/fi";
import CreateIngredientModal from "../../components/shoppingList/CreateIngredientModal";
const ShoppingList: React.FC = () => {
  const [list, setList] = useState<ShoppingListData>({} as ShoppingListData);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(
    null
  );
  const [editedIngredient, setEditedIngredient] = useState<{
    name: string;
    quantity: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null); // Track open dropdowns
  const auth = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal visibility

  useEffect(() => {
    const fetchData = async () => {
      const token = auth.auth?.token;
      if (!token) {
        return;
      }

      try {
        const response = await postFetcher.getShoppingList(token);
        if (response) {
          setList(response as unknown as ShoppingListData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [auth.token]);

  const [expandedPosts, setExpandedPosts] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const parseQuantity = (quantity: any) => {
    const quantityStr =
      typeof quantity === "string" ? quantity : String(quantity);

    const match = quantityStr.match(/^(\d+\.?\d*)\s*(.*)$/);

    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2].trim(),
      };
    }
    return { value: 0, unit: "" };
  };

  const startEditing = (
    ingredientId: string,
    name: string,
    quantity: string
  ) => {
    setEditingIngredientId(ingredientId);
    setEditedIngredient({ name, quantity });
    setDropdownOpen(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedIngredient) {
      setEditedIngredient({ ...editedIngredient, [name]: value });
    }
  };

  const saveChanges = (ingredientId: string) => {
    if (editedIngredient) {
      const updatedPosts = list.posts.map((post) => ({
        ...post,
        ingredients: post.ingredients.map((ingredient) =>
          ingredient._id === ingredientId
            ? {
                ...ingredient,
                name: editedIngredient.name,
                quantity: editedIngredient.quantity,
              }
            : ingredient
        ),
      }));

      const updatedStandaloneIngredients = list.standaloneIngredients.map(
        (ingredient) =>
          ingredient._id === ingredientId
            ? {
                ...ingredient,
                name: editedIngredient.name,
                quantity: editedIngredient.quantity,
              }
            : ingredient
      );

      setList({
        ...list,
        posts: updatedPosts,
        standaloneIngredients: updatedStandaloneIngredients,
      });
      setEditingIngredientId(null);
      setEditedIngredient(null);
    }
  };

  const cancelEditing = () => {
    setEditingIngredientId(null);
    setEditedIngredient(null);
  };

  const handleDelete = (ingredientId: string) => {
    const updatedPosts = list.posts.map((post) => ({
      ...post,
      ingredients: post.ingredients.filter(
        (ingredient) => ingredient._id !== ingredientId
      ),
    }));

    const updatedStandaloneIngredients = list.standaloneIngredients.filter(
      (ingredient) => ingredient._id !== ingredientId
    );

    setList({
      ...list,
      posts: updatedPosts,
      standaloneIngredients: updatedStandaloneIngredients,
    });
    setDropdownOpen(null);
  };

  const toggleDropdown = (ingredientId: string) => {
    setDropdownOpen((prevId) =>
      prevId === ingredientId ? null : ingredientId
    );
  };

  const handleAddIngredient = async (ingredients: ingredientOfListSchema[]) => {
    const token = auth.auth?.token;
    if (!token) {
      return;
    }
    const newIngredient = (await postFetcher.addIngredientToShoppingList(
      token,
      undefined,
      undefined,
      ingredients
    )) as unknown as ShoppingListData;
    if (newIngredient) {
      setList((prevList) => ({
        ...prevList,
        standaloneIngredients: newIngredient.standaloneIngredients,
      }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold">GROCERY LIST.</h1>

      {/* Render Posts */}
      {list.posts?.map((post) => (
        <div key={post.postId} className="card bg-base-100 shadow-md my-4">
          <div className="card-body">
            <div className="flex items-center">
              {/* Image */}
              <img
                src={post.imageUrl}
                alt={`Image for ${post.postId}`}
                className="w-16 h-16 object-cover rounded mr-4"
              />

              {/* Title and Servings */}
              <div className="flex-1">
                <h2 className="card-title">{post.title}</h2>
                <p className="text-sm">Servings: {post.servings}</p>
              </div>

              {/* Toggle expand/collapse */}
              <button className="p-2" onClick={() => toggleExpand(post.postId)}>
                {expandedPosts[post.postId] ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Ingredients, only show if expanded */}
            {expandedPosts[post.postId] && (
              <div className="mt-4">
                {post.ingredients.map((ingredient) => (
                  <div
                    key={ingredient._id}
                    className="card bg-base-100 shadow-md my-2 p-4 relative"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        {editingIngredientId === ingredient._id ? (
                          <div>
                            <input
                              type="text"
                              name="name"
                              value={editedIngredient?.name || ingredient.name}
                              onChange={handleInputChange}
                              className="input input-bordered w-full mb-2"
                            />
                            <input
                              type="text"
                              name="quantity"
                              value={
                                editedIngredient?.quantity ||
                                ingredient.quantity
                              }
                              onChange={handleInputChange}
                              className="input input-bordered w-full mb-2"
                            />
                            <button
                              onClick={() => saveChanges(ingredient._id)}
                              className="btn btn-success mr-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="btn btn-error"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold">{ingredient.name}</span>
                            <span className="ml-4">
                              {parseQuantity(ingredient.quantity).value *
                                Number(post.servings)}{" "}
                              {parseQuantity(ingredient.quantity).unit}
                            </span>
                          </div>
                        )}
                      </div>
                      {!editingIngredientId ||
                      editingIngredientId !== ingredient._id ? (
                        <button
                          onClick={() => toggleDropdown(ingredient._id)}
                          disabled={isModalOpen}
                        >
                          <FiMoreVertical />
                        </button>
                      ) : null}
                    </div>

                    {/* Dropdown Menu */}
                    {dropdownOpen === ingredient._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          onClick={() =>
                            startEditing(
                              ingredient._id,
                              ingredient.name,
                              ingredient.quantity
                            )
                          }
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient._id)}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Render Standalone Ingredients */}
      <div className="card bg-base-100 shadow-md my-4">
        <div className="card-body">
          <h2 className="card-title">Standalone Ingredients</h2>
          {list.standaloneIngredients?.map((ingredient) => (
            <div
              key={ingredient._id}
              className="card bg-base-100 shadow-md my-2 p-4 relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {editingIngredientId === ingredient._id ? (
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={editedIngredient?.name || ingredient.name}
                        onChange={handleInputChange}
                        className="input input-bordered w-full mb-2"
                      />
                      <input
                        type="text"
                        name="quantity"
                        value={
                          editedIngredient?.quantity || ingredient.quantity
                        }
                        onChange={handleInputChange}
                        className="input input-bordered w-full mb-2"
                      />
                      <button
                        onClick={() => saveChanges(ingredient._id)}
                        className="btn btn-success mr-2"
                      >
                        Save
                      </button>
                      <button onClick={cancelEditing} className="btn btn-error">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold">{ingredient.name}</span>
                      <span className="ml-4">{ingredient.quantity}</span>
                    </div>
                  )}
                </div>
                {!editingIngredientId ||
                editingIngredientId !== ingredient._id ? (
                  <button
                    onClick={() => toggleDropdown(ingredient._id)}
                    disabled={isModalOpen}
                  >
                    <FiMoreVertical />
                  </button>
                ) : null}
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen === ingredient._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    onClick={() =>
                      startEditing(
                        ingredient._id,
                        ingredient.name,
                        ingredient.quantity
                      )
                    }
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ingredient._id)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between items-center">
        {/* Add Ingredient Button */}
        <button
          className="btn btn-primary mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add to List
        </button>

        {/* Modal */}
        <CreateIngredientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddIngredient}
        />
      </div>
    </div>
  );
};

export default ShoppingList;
