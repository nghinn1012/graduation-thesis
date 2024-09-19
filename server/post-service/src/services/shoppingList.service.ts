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
          servings,
          ingredients: postIngredients,
        });
      }
    } else {
      shoppingList.standaloneIngredients.push(ingredients);
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
