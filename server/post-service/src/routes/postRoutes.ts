import express from "express";
import { createPostController, deletePostController, getAllPostsController, getPostController, searchPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";
import { getPostLikesByUserController, getSavedPostsByUserController, isLikedPostByUserController, isSavedPostByUserController, likeOrUnlikePostController, saveOrUnsavedPostController } from "../controllers/postAction.controller";
import { createMadeRecipeController, deleteMadeRecipeController, getMadeRecipeByIdController, getMadeRecipeOfPostController, updateMadeRecipeController } from "../controllers/madeRecipe.controllers";
import { createCommentController, deleteCommentController, getCommentByIdController, getCommentByPostIdController, likeOrUnlikeCommentController, updateCommentController } from "../controllers/comment.controllers";
import { addIngredientToShoppingListController, checkPostInShoppingListController, getShoppingListController, removeIngredientFromShoppingListController, removeIngredientsFromShoppingListController, removePostFromShoppingListController, updateIngredientInShoppingListController } from "../controllers/shoppingList.controllers";
import { addMealController, checkPostInUnscheduledMealController, getMealPlannerController, removeMealController, scheduleMealController } from "../controllers/mealPlanner.controllers";

const postRouter = express.Router();
// mealPlanner
postRouter.post("/mealPlanner/create", tokenValidate, addMealController);
postRouter.get("/mealPlanner/checkPost/:postId", tokenValidate, checkPostInUnscheduledMealController);
postRouter.get("/mealPlanner/getAll", tokenValidate, getMealPlannerController);
postRouter.delete("/mealPlanner/remove", tokenValidate, removeMealController);
postRouter.patch("/mealPlanner/scheduleMeal", tokenValidate, scheduleMealController);
// shoppinglist
postRouter.patch("/shoppingList/removeIngredients", tokenValidate, removeIngredientsFromShoppingListController);
postRouter.post("/shoppingList/add", tokenValidate, addIngredientToShoppingListController);
postRouter.get("/shoppingList", tokenValidate, getShoppingListController);
postRouter.get("/shoppingList/:postId", tokenValidate, checkPostInShoppingListController);
postRouter.patch("/shoppingList/removeIngredient", tokenValidate, removeIngredientFromShoppingListController);
postRouter.patch("/shoppingList/update", tokenValidate, updateIngredientInShoppingListController);
postRouter.patch("/shoppingList/:postId", tokenValidate, removePostFromShoppingListController);
// comment
postRouter.post("/:commentId/likeComment", tokenValidate, likeOrUnlikeCommentController);

postRouter.post("/:postId/comment", tokenValidate, createCommentController);
postRouter.get("/:postId/comment", tokenValidate, getCommentByPostIdController);
postRouter.get("/:commentId/getComment", tokenValidate, getCommentByIdController);
postRouter.patch("/:commentId/comment", tokenValidate, updateCommentController);
postRouter.delete("/:commentId/comment", tokenValidate, deleteCommentController);

postRouter.post("/:id/like", tokenValidate, likeOrUnlikePostController);
postRouter.get("/likes", tokenValidate, getPostLikesByUserController);
postRouter.post("/:id/save", tokenValidate, saveOrUnsavedPostController);
postRouter.get("/savedList", tokenValidate, getSavedPostsByUserController);
postRouter.get("/:id/isLiked", tokenValidate, isLikedPostByUserController);
postRouter.get("/:id/isSaved", tokenValidate, isSavedPostByUserController);
// recipe

postRouter.get("/:id/getMades", tokenValidate, getMadeRecipeOfPostController);
postRouter.post("/:id/made", tokenValidate, createMadeRecipeController);
postRouter.patch("/:madeRecipeId/made", tokenValidate, updateMadeRecipeController);
postRouter.get("/:madeRecipeId/made", tokenValidate, getMadeRecipeByIdController);
postRouter.delete("/:madeRecipeId/made", tokenValidate, deleteMadeRecipeController);

postRouter.get("/search", tokenValidate, searchPostController);
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.get("/", tokenValidate, getAllPostsController);
postRouter.delete("/:id", tokenValidate, deletePostController);

postRouter.use(errorHandler);
export default postRouter;
