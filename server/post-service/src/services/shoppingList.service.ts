import { IngredientOfList, updateIngredientInShoppingList } from "../data/interface/shoppingList_interface";
import ShoppingListModel from "../models/shoppingListModel.model";
import PostModel from "../models/postModel";
import { isValidObjectId } from "mongoose";

export const addIngredientToShoppingListService = async (
  postId: string | null,
  servings: number,
  userId: string,
  ingredients: IngredientOfList[]
) => {
  try {
    let shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      const post = postId ? await PostModel.findById(postId).exec() : null;
      if (!post) {
        throw new Error(`Post with id ${postId} not found`);
      }
      shoppingList = new ShoppingListModel({
        userId,
        posts: postId ? [{
          postId,
          title: post.title || "No title available",
          imageUrl: post.images?.[0] || "No image available",
          servings,
          ingredients: post.ingredients.map(ingredient => ({
            ...ingredient.toObject(),
            checked: false,
          })),
        }] : [],
        standaloneIngredients: postId ? [] : ingredients,
      });
    }

    if (postId) {
      const postIndex = shoppingList.posts.findIndex(post => post?.postId?.toString() === postId);

      if (postIndex !== -1) {
        // Post đã tồn tại, cập nhật servings
        shoppingList.posts[postIndex].servings += servings;
      } else {
        // Nếu post chưa tồn tại trong shoppingList
        const post = await PostModel.findById(postId).exec();
        if (!post) {
          throw new Error(`Post with id ${postId} not found`);
        }

        const postIngredients: IngredientOfList[] = post.ingredients.map(ingredient => ({
          ...ingredient.toObject(),
          checked: false,
        }));

        // Kiểm tra title và imageUrl
        const postTitle = post?.title || "No title available";
        const postImageUrl = post?.images?.[0] || "No image available";

        if (!postTitle || !postImageUrl) {
          throw new Error(`Post title or imageUrl is missing for post with id ${postId}`);
        }

        shoppingList.posts.push({
          postId,
          title: postTitle,
          imageUrl: postImageUrl,
          servings,
          ingredients: postIngredients,
        });
      }
    } else {
      // Thêm các ingredient không liên kết với post
      shoppingList.standaloneIngredients.push(...ingredients);
    }

    await shoppingList.save();
    return shoppingList;

  } catch (error) {
    console.error("Error updating shopping list:", error);
    throw new Error((error as Error).message);
  }
};


export const getShoppingListService = async (userId: string) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      return [];
    }
    return shoppingList;
  } catch (error) {
    console.error("Error getting shopping list:", error);
    throw new Error((error as Error).message);
  }
}

export const checkPostInShoppingListService = async (userId: string, postId: string) => {
  try {
    const shoppingLists = await ShoppingListModel.find({ userId }).exec();
    const shoppingListsWithPost = shoppingLists.filter(list => list.posts.some(post => post?.postId?.toString() === postId));
    if (shoppingListsWithPost.length === 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking post in shopping list:", error);
    throw new Error((error as Error).message);
  }
}

export const removePostFromShoppingListService = async (userId: string, postId: string) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    const response = await ShoppingListModel.updateOne(
      { userId },
      { $pull: { posts: { postId } } }
    ).exec();
    return response;
  } catch (error) {
    console.error("Error removing post from shopping list:", error);
    throw new Error((error as Error).message);
  }
}

export const updateIngredientInShoppingListService = async (
  userId: string,
  ingredient: updateIngredientInShoppingList,
  postId?: string
) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }

    if (!ingredient.name || !ingredient.quantity) {
      throw new Error("Ingredient name and quantity are required");
    }

    if (postId) {
      const postIndex = shoppingList.posts.findIndex(
        (post) => post?.postId?.toString() === postId
      );
      if (postIndex === -1) {
        throw new Error("Post not found in shopping list");
      }
      const ingredientIndex = shoppingList.posts[postIndex].ingredients.findIndex(
        (ingr) => ingr._id?.toString() === ingredient._id?.toString()
      );
      if (ingredientIndex === -1) {
        throw new Error("Ingredient not found in post");
      }

      // Update ingredient in post
      shoppingList.posts[postIndex].ingredients[ingredientIndex].set({
        name: ingredient.name,
        quantity: ingredient.quantity,
        checked: !shoppingList.posts[postIndex].ingredients[ingredientIndex].checked,
      });
    } else {
      const ingredientIndex = shoppingList.standaloneIngredients.findIndex(
        (ingr) => ingr._id?.toString() === ingredient._id?.toString()
      );
      if (ingredientIndex === -1) {
        throw new Error("Ingredient not found in standalone ingredients");
      }

      // Update standalone ingredient
      shoppingList.standaloneIngredients[ingredientIndex].set({
        name: ingredient.name,
        quantity: ingredient.quantity,
        checked: !shoppingList.standaloneIngredients[ingredientIndex].checked,
      });
    }

    // Save the updated shopping list
    await shoppingList.save();
    return shoppingList;
  } catch (error) {
    console.error("Error updating ingredient in shopping list:", error);
    throw new Error((error as Error).message);
  }
};

export const removeIngredientFromShoppingListService = async (userId: string, ingredientId: string, postId?: string) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    if (postId) {
      const postIndex = shoppingList.posts.findIndex(
        (post) => post?.postId?.toString() === postId
      );
      if (postIndex === -1) {
        throw new Error("Post not found in shopping list");
      }
      const ingredientIndex = shoppingList.posts[postIndex].ingredients.findIndex(
        (ingr) => ingr._id?.toString() === ingredientId
      );
      if (ingredientIndex === -1) {
        throw new Error("Ingredient not found in post");
      }

      shoppingList.posts[postIndex].ingredients.splice(ingredientIndex, 1);
      if (shoppingList.posts[postIndex].ingredients.length === 0) {
        shoppingList.posts.splice(postIndex, 1);
      }
    }
    else {
      const ingredientIndex = shoppingList.standaloneIngredients.findIndex(
        (ingr) => ingr._id?.toString() === ingredientId
      );
      if (ingredientIndex === -1) {
        throw new Error("Ingredient not found in standalone ingredients");
      }

      shoppingList.standaloneIngredients.splice(ingredientIndex, 1);
    }
    console.log(shoppingList);
    await shoppingList.save();
    return shoppingList;
  } catch (error) {
    console.error("Error removing ingredient from shopping list:", error);
    throw new Error((error as Error).message);
  }
}

export const removeIngredientsFromShoppingListService = async (
  userId: string,
  ingredientIds: string[],
  postIds?: string[]
) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    await Promise.all(
      ingredientIds.map(async (ingredientId, index) => {
        const postId = postIds ? postIds[index] : undefined;
        console.log(postId);
        if (postId) {
          const postIndex = shoppingList.posts.findIndex(
            (post) => post?.postId?.toString() === postId
          );

          if (postIndex === -1) {
            throw new Error(`Post not found in shopping list for postId: ${postId}`);
          }

          const ingredientIndex = shoppingList.posts[postIndex].ingredients.findIndex(
            (ingr) => ingr._id?.toString() === ingredientId
          );

          if (ingredientIndex === -1) {
            throw new Error(`Ingredient not found in post with postId: ${postId}`);
          }

          shoppingList.posts[postIndex].ingredients.splice(ingredientIndex, 1);

          if (shoppingList.posts[postIndex].ingredients.length === 0) {
            shoppingList.posts.splice(postIndex, 1);
          }
        } else {
          const ingredientIndex = shoppingList.standaloneIngredients.findIndex(
            (ingr) => ingr._id?.toString() === ingredientId
          );

          if (ingredientIndex === -1) {
            throw new Error(`Ingredient not found in standalone ingredients for ingredientId: ${ingredientId}`);
          }

          shoppingList.standaloneIngredients.splice(ingredientIndex, 1);
        }
      })
    );

    await shoppingList.save();
    return shoppingList;
  } catch (error) {
    console.error("Error removing ingredients from shopping list:", error);
    throw new Error((error as Error).message);
  }
};
