import express from "express";
import { createPostController, deletePostController, getAllPostsController, getPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";
import { getPostLikesByUserController, getSavedPostsByUserController, isLikedPostByUserController, isSavedPostByUserController, likeOrUnlikePostController, saveOrUnsavedPostController } from "../controllers/postAction.controller";
import { createMadeRecipeController, deleteMadeRecipeController, getMadeRecipeByIdController, getMadeRecipeOfPostController, updateMadeRecipeController } from "../controllers/madeRecipe.controllers";

const postRouter = express.Router();
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

postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.get("/", tokenValidate, getAllPostsController);
postRouter.delete("/:id", tokenValidate, deletePostController);

postRouter.use(errorHandler);
export default postRouter;
