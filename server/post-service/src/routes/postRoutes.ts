import express from "express";
import { createPostController, deletePostController, getAllPostsController, getAllPostsOfUserController, getPostController, searchPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";
import { getPostByUserFollowingController, getPostLikesByUserController, getSavedPostsByUserController, isLikedPostByUserController, isSavedPostByUserController, likeOrUnlikePostController, saveOrUnsavedPostController } from "../controllers/postAction.controller";
import { createMadeRecipeController, deleteMadeRecipeController, getMadeRecipeByIdController, getMadeRecipeOfPostController, updateMadeRecipeController } from "../controllers/madeRecipe.controllers";
import { createCommentController, deleteCommentController, getCommentByIdController, getCommentByPostIdController, likeOrUnlikeCommentController, updateCommentController } from "../controllers/comment.controllers";
import { addIngredientToShoppingListController, checkPostInShoppingListController, getShoppingListController, removeIngredientFromShoppingListController, removeIngredientsFromShoppingListController, removePostFromShoppingListController, updateIngredientInShoppingListController } from "../controllers/shoppingList.controllers";
import { addMealController, checkPostInUnscheduledMealController, getMealPlannerController, removeMealController, scheduleMealController } from "../controllers/mealPlanner.controllers";
import { addProductToCartController, searchProductsController, createReviewProductController, getAllProductsController, getCartController, getProductByPostIdController, removeProductFromCartController, createOrderController, getOrdersByUserController, getOrderOfSellerController, getOrderByIdController, cancelOrderController, updateOrderStatusController } from "../controllers/product.controller";

const postRouter = express.Router();
// product
postRouter.patch("/product/addToCart", tokenValidate, addProductToCartController);
postRouter.get("/product/getAll", tokenValidate, getAllProductsController);
postRouter.get("/product/getCart", tokenValidate, getCartController);
postRouter.get("/product/getProductByPostId/:postId", tokenValidate, getProductByPostIdController);
postRouter.patch("/product/removeProductFromCart", tokenValidate, removeProductFromCartController);
postRouter.post("/product/createReview", tokenValidate, createReviewProductController);
postRouter.get("/product/search", tokenValidate, searchProductsController);
postRouter.post("/order/create", tokenValidate, createOrderController);
postRouter.get("/order/getOrderByUser", tokenValidate, getOrdersByUserController);
postRouter.get("/order/getOrderBySeller", tokenValidate, getOrderOfSellerController);
postRouter.get("/order/getOrderById/:orderId", tokenValidate, getOrderByIdController);
postRouter.patch("/order/cancelOrder", tokenValidate, cancelOrderController);
postRouter.patch("/order/updateOrderStatus", tokenValidate, updateOrderStatusController);

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

postRouter.get("/following", tokenValidate, getPostByUserFollowingController);
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

postRouter.get("/:userId/getAllOfUser", tokenValidate, getAllPostsOfUserController);
postRouter.get("/search", tokenValidate, searchPostController);
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.get("/", tokenValidate, getAllPostsController);
postRouter.delete("/:id", tokenValidate, deletePostController);

postRouter.use(errorHandler);
export default postRouter;
