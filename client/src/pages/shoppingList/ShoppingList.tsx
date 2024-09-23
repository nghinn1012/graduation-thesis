import React, { useEffect, useRef, useState } from "react";
import {
  ingredientOfListSchema,
  postFetcher,
  ShoppingListData,
} from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FiMoreVertical } from "react-icons/fi";
import CreateIngredientModal from "../../components/shoppingList/CreateIngredientModal";
import { BsCheckCircle } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import ShoppingListSkeleton from "../../components/skeleton/ShoppingListSkeleton";
const ShoppingList: React.FC = () => {
  const [list, setList] = useState<ShoppingListData>({} as ShoppingListData);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(
    null
  );
  const [editedIngredient, setEditedIngredient] = useState<{
    name: string;
    quantity: string;
    checked?: boolean;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const auth = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );
  const [allStandaloneSelected, setAllStandaloneSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  useEffect(() => {
    const fetchData = async () => {
      const token = auth.auth?.token;
      if (!token) {
        return;
      }
      setLoading(true);
      try {
        const response = await postFetcher.getShoppingList(token);
        if (response) {
          setList(response as unknown as ShoppingListData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [auth.token]);

  useEffect(() => {
    const token = auth.auth?.token;
    if (!token) {
      return;
    }
    if (!list.standaloneIngredients) {
      return;
    }
    const allSelected = list.standaloneIngredients.every((item) =>
      selectedIngredientIds.includes(item._id)
    );
    setAllStandaloneSelected(allSelected);
  }, [list.standaloneIngredients, auth.token, selectedIngredientIds]);

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

  const saveChanges = (ingredientId: string, postId?: string) => {
    const token = auth.auth?.token;
    if (!token || !editedIngredient) {
      return;
    }

    const updateIngredient = async () => {
      const newIngredient = (await postFetcher.updateIngredientInShoppingList(
        token,
        {
          _id: ingredientId,
          name: editedIngredient.name,
          quantity: editedIngredient.quantity,
          checked: false,
        },
        postId
      )) as unknown as ShoppingListData;
      if (newIngredient) {
        if (postId) {
          setList((prevList) => ({
            ...prevList,
            posts: prevList.posts.map((post) => {
              if (post.postId === postId) {
                return {
                  ...post,
                  ingredients: post.ingredients.map((ing) => {
                    if (ing._id === ingredientId) {
                      return {
                        ...ing,
                        name: editedIngredient.name,
                        quantity: editedIngredient.quantity,
                      };
                    }
                    return ing;
                  }),
                };
              }
              return post;
            }),
          }));
        } else {
          setList((prevList) => ({
            ...prevList,
            standaloneIngredients: prevList.standaloneIngredients.map((ing) => {
              if (ing._id === ingredientId) {
                return {
                  ...ing,
                  name: editedIngredient.name,
                  quantity: editedIngredient.quantity,
                };
              }
              return ing;
            }),
          }));
        }
      }
    };

    updateIngredient();
    setEditingIngredientId(null);
    setEditedIngredient(null);
  };

  const cancelEditing = () => {
    setEditingIngredientId(null);
    setEditedIngredient(null);
  };

  const handleDelete = (ingredientId: string, postId?: string) => {
    const token = auth.auth?.token;
    if (!token) {
      return;
    }

    const deleteIngredient = async () => {
      const newIngredient = (await postFetcher.removeIngredientFromShoppingList(
        token,
        ingredientId,
        postId
      )) as unknown as ShoppingListData;
      if (newIngredient) {
        if (postId) {
          setList((prevList) => ({
            ...prevList,
            posts: prevList.posts.map((post) => {
              if (post.postId === postId) {
                return {
                  ...post,
                  ingredients: post.ingredients.filter(
                    (ing) => ing._id !== ingredientId
                  ),
                };
              }
              return post;
            }),
          }));
        } else {
          setList((prevList) => ({
            ...prevList,
            standaloneIngredients: prevList.standaloneIngredients.filter(
              (ing) => ing._id !== ingredientId
            ),
          }));
        }
      }
    };

    deleteIngredient();
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

  const togglePostSelection = (postId: string) => {
    const isSelected = selectedPostIds.includes(postId);
    const post = list.posts.find((p) => p.postId === postId);

    if (!post) return;

    const ingredientIds = post.ingredients.map((ing) => ing._id);

    if (isSelected) {
      setSelectedPostIds((prev) => prev.filter((id) => id !== postId));
      setSelectedIngredientIds((prev) =>
        prev.filter((id) => !ingredientIds.includes(id))
      );
    } else {
      setSelectedPostIds((prev) => [...prev, postId]);
      setSelectedIngredientIds((prev) => [...prev, ...ingredientIds]);
    }

    console.log(selectedPostIds);
    console.log(selectedIngredientIds);
  };

  const toggleIngredientSelection = (ingredientId: string) => {
    setSelectedIngredientIds((prev) => {
      const updatedIds = prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId];

      const postId = list.posts.find((post) =>
        post.ingredients.some((ingredient) => ingredient._id === ingredientId)
      )?.postId;
      if (postId) {
        const post = list.posts.find((p) => p.postId === postId);
        if (!post) return updatedIds;
        const ingredientIds = post.ingredients.map((ing) => ing._id);
        const allSelected = ingredientIds.every((id) =>
          updatedIds.includes(id)
        );

        if (allSelected && !selectedPostIds.includes(postId)) {
          setSelectedPostIds((prev) => [...prev, postId]);
        } else if (!allSelected && selectedPostIds.includes(postId)) {
          setSelectedPostIds((prev) => prev.filter((id) => id !== postId));
        }
      }

      return updatedIds;
    });
    console.log(selectedIngredientIds);
  };

  const handleDeleteIngredients = async () => {
    const token = auth.auth?.token;
    if (!token) {
      return;
    }
    const selectedPostIds = selectedIngredientIds.map(
      (id) =>
        list.posts.find((post) =>
          post.ingredients.some((ingredient) => ingredient._id === id)
        )?.postId || ""
    );
    if (!selectedPostIds) return;
    const deleteIngredients = async () => {
      const newIngredients =
        (await postFetcher.removeIngredientsFromShoppingList(
          token,
          selectedIngredientIds,
          selectedPostIds
        )) as unknown as ShoppingListData;
      if (newIngredients) {
        setList(newIngredients);
        setSelectedPostIds([]);
        setSelectedIngredientIds([]);
        setAllStandaloneSelected(false);
      }
    };

    deleteIngredients();
  };

  const toggleStandaloneSelection = () => {
    const standaloneIngredientIds = list.standaloneIngredients?.map(
      (ing) => ing._id
    );
    if (allStandaloneSelected) {
      setSelectedIngredientIds((prev) =>
        prev.filter((id) => !standaloneIngredientIds.includes(id))
      );
    } else {
      setSelectedIngredientIds((prev) => [...prev, ...standaloneIngredientIds]);
    }
    setAllStandaloneSelected(!allStandaloneSelected);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const isDropdown = Object.values(dropdownRefs.current).some((ref) =>
      ref?.contains(event.target as Node)
    );
    if (!isDropdown) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold">GROCERY LIST.</h1>
      <button
        className={`btn btn-danger top-4 right-4 ${
          selectedIngredientIds.length === 0
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={handleDeleteIngredients}
        disabled={selectedIngredientIds.length === 0}
      >
        Delete Selected
      </button>
      {/* Render Posts */}
      {loading ? (
        <>
          <ShoppingListSkeleton />
          <ShoppingListSkeleton />
        </>
      ) : (
        <>
          {list.posts?.map(
            (post) =>
              post.ingredients.length > 0 && (
                <div
                  key={post.postId}
                  ref={(el) => (dropdownRefs.current[post.postId] = el)}
                  className="card bg-base-100 shadow-md my-4"
                >
                  <div className="card-body">
                    <div className="flex items-center">
                      {selectedPostIds.includes(post.postId) ? (
                        <div className="flex items-center">
                          <BsCheckCircle
                            className={`text-green-700 w-16 h-16 object-cover rounded mr-4`}
                            onClick={() => togglePostSelection(post.postId)}
                          />
                        </div>
                      ) : (
                        <img
                          src={post.imageUrl}
                          alt={`Image for ${post.postId}`}
                          className={`w-16 h-16 object-cover rounded mr-4`}
                          onClick={() => togglePostSelection(post.postId)}
                        />
                      )}

                      {/* Title and Servings */}
                      <div className="flex-1">
                        <h2 className="card-title">{post.title}</h2>
                        <p className="text-sm">Servings: {post.servings}</p>
                      </div>

                      {/* Toggle expand/collapse */}
                      <button
                        className="p-2"
                        onClick={() => toggleExpand(post.postId)}
                      >
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

                    {expandedPosts[post.postId] && (
                      <div className="mt-4">
                        {post.ingredients.map((ingredient) => (
                          <div
                            key={ingredient._id}
                            ref={(el) => (dropdownRefs.current[ingredient._id] = el)}
                            className="card bg-base-100 shadow-md my-2 p-4 relative"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                {editingIngredientId === ingredient._id ? (
                                  <div>
                                    <input
                                      type="text"
                                      name="name"
                                      value={editedIngredient?.name || ""}
                                      onChange={handleInputChange}
                                      className="input input-bordered w-full mb-2"
                                    />
                                    <input
                                      type="text"
                                      name="quantity"
                                      value={editedIngredient?.quantity || ""}
                                      onChange={handleInputChange}
                                      className="input input-bordered w-full mb-2"
                                    />
                                    <button
                                      onClick={() =>
                                        saveChanges(ingredient._id, post.postId)
                                      }
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
                                  <div className="flex flex-row gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedIngredientIds.includes(
                                        ingredient._id
                                      )}
                                      onChange={() =>
                                        toggleIngredientSelection(
                                          ingredient._id
                                        )
                                      }
                                      className="checkbox checkbox-success border-2"
                                    />
                                    <span className="font-bold">
                                      {ingredient.name}
                                    </span>
                                    <span className="ml-4">
                                      {parseQuantity(ingredient.quantity)
                                        .value * Number(post.servings)}{" "}
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

                            {dropdownOpen === ingredient._id && (
                              <div className="absolute right-0 mt-5 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
                                  onClick={() =>
                                    handleDelete(ingredient._id, post.postId)
                                  }
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
              )
          )}

          <div className="card bg-base-100 shadow-md my-4">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="card-title">Standalone Ingredients</h2>
                  <button
                    className="p-2"
                    onClick={() => toggleExpand("standalone")}
                  >
                    {expandedPosts["standalone"] ? (
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
                <FaCheckCircle
                  onClick={toggleStandaloneSelection}
                  className={`h-6 w-6 ${
                    allStandaloneSelected ? "text-green-500" : "text-gray-500"
                  }`}
                />
              </div>

              {expandedPosts["standalone"] &&
                list.standaloneIngredients?.map((ingredient) => (
                  <div
                    key={ingredient._id}
                    ref={(el) => (dropdownRefs.current[ingredient._id] = el)}
                    className="card bg-base-100 shadow-md my-2 p-4 relative"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        {editingIngredientId === ingredient._id ? (
                          <div>
                            <input
                              type="text"
                              name="name"
                              value={editedIngredient?.name || ""}
                              onChange={handleInputChange}
                              className="input input-bordered w-full mb-2"
                            />
                            <input
                              type="text"
                              name="quantity"
                              value={editedIngredient?.quantity || ""}
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
                          <div className="flex flex-row gap-2">
                            <input
                              type="checkbox"
                              checked={selectedIngredientIds.includes(
                                ingredient._id
                              )}
                              onChange={() =>
                                toggleIngredientSelection(ingredient._id)
                              }
                              className="checkbox checkbox-success border-2"
                            />
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

                    {dropdownOpen === ingredient._id && (
                      <div className="absolute right-0 mt-5 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
            <button
              className="btn btn-primary mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add to List
            </button>

            <CreateIngredientModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleAddIngredient}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingList;
