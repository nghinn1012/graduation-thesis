import { AuthRequest } from "../data";
import { addProductToCartService, createReviewProductService, getAllProductsService, getCartService, getProductByPostIdService, removeProductFromCartService, searchProductsService } from "../services/product.services";
import { Response } from "express";
export const addProductToCartController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Failed to add product to cart",
        error: "User not found",
      });
    }
    const { productId, quantity } = req.body;
    const cart = await addProductToCartService(userId, productId, quantity);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to add product to cart",
      error: (error as Error).message,
    });
  }
}

export const getAllProductsController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  const { page, limit } = req.query;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: "User not found",
    });
  }
  try {
  const products = await getAllProductsService(page as unknown as number, limit as unknown as number);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: (error as Error).message,
    });
  }
}

export const getCartController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get cart",
      error: "User not found",
    });
  }
  try {
    const cart = await getCartService(userId);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get cart",
      error: (error as Error).message,
    });
  }
}

export const getProductByPostIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get product",
      error: "User not found",
    });
  }
  const { postId } = req.params;
  try {
    const product = await getProductByPostIdService(postId);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get product",
      error: (error as Error).message,
    });
  }
}

export const removeProductFromCartController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to remove product from cart",
      error: "User not found",
    });
  }
  const { productId } = req.params;
  try {
    const cart = await removeProductFromCartService(userId, productId);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to remove product from cart",
      error: (error as Error).message,
    });
  }
}

export const createReviewProductController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to create review for product",
      error: "User not found",
    });
  }
  const { productId, ...reviewData } = req.body;
  try {
    const product = await createReviewProductService(userId, productId, reviewData);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create review for product",
      error: (error as Error).message,
    });
  }
}

export const searchProductsController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to search products",
      error: "User not found",
    });
  }
  const { query, page, limit } = req.query;
  try {
    const products = await searchProductsService(query as string, page as unknown as number, limit as unknown as number);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to search products",
      error: (error as Error).message,
    });
  }
}
