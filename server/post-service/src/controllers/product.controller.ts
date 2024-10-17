import { AuthRequest } from "../data";
import { addProductToCartService, getAllProductsService } from "../services/product.services";
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
    await addProductToCartService(userId, productId, quantity);
    return res.status(200).json({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to add product to cart",
      error: (error as Error).message,
    });
  }
}

export const getAllProductsController = async (req: AuthRequest, res: Response) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: "User not found",
    });
  }
  try {
    const products = await getAllProductsService();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: (error as Error).message,
    });
  }
}
