import { IngredientOfList } from "../data/interface/shoppingList_interface";
import ShoppingListModel from "../models/shoppingListModel.model";
import PostModel from "../models/postModel";

export const addIngredientToShoppingListService = async (
  postId: string | null,
  servings: number,
  userId: string,
  ingredients: IngredientOfList[]
) => {
  try {
    let shoppingList = await ShoppingListModel.findOne({ userId }).exec();

    if (!shoppingList) {
      shoppingList = new ShoppingListModel({
        userId,
        posts: postId ? [{
          postId,
          servings,
          ingredients: [],
        }] : [],
        standaloneIngredients: postId ? [] : ingredients,
      });
      await shoppingList.save();
      return shoppingList;
    }

    if (postId) {
      const postIndex = shoppingList.posts.findIndex(post => post?.postId?.toString() === postId);

      if (postIndex !== -1) {
        shoppingList.posts[postIndex].servings += servings;
      } else {
        const post = await PostModel.findById(postId).exec();
        if (!post) {
          throw new Error(`Post with id ${postId} not found`);
        }

        const postIngredients: IngredientOfList[] = post.ingredients.map(ingredient => ({
          ...ingredient.toObject(),
          checked: false,
        }));

        shoppingList.posts.push({
          postId,
          title: post.title,
          imageUrl: post.images[0],
          servings,
          ingredients: postIngredients,
        });
      }
    } else {
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

export const updateIngredientInShoppingListService = async (userId: string, ingredients: IngredientOfList[], postId?: string) => {
  try {
    const shoppingList = await ShoppingListModel.findOne({ userId }).exec();
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    if (postId) {
      const postIndex = shoppingList.posts.findIndex(post => post?.postId?.toString() === postId);
      if (postIndex === -1) {
        throw new Error("Post not found in shopping list");
      }
      shoppingList.posts[postIndex].ingredients.splice(
        0,
        shoppingList.posts[postIndex].ingredients.length,
        ...ingredients.map(ingredient => shoppingList.posts[postIndex].ingredients.create(ingredient))
      );
    }
    await shoppingList.save();
    return shoppingList;
  } catch (error) {
    console.error("Error updating ingredient in shopping list:", error);
    throw new Error((error as Error).message);
  }
}
