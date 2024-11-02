import { AuthRequest } from "../data";
import {
  addProductToCartService,
  cancelOrderService,
  createOrderService,
  createReviewProductService,
  getAllProductsService,
  getCartService,
  getOrderByIdService,
  getOrderOfSellerService,
  getOrdersByUserService,
  getProductByPostIdService,
  removeProductsFromCartService,
  searchProductsService,
  updateOrderStatusService,
} from "../services/product.services";
import { Response } from "express";
export const addProductToCartController = async (
  req: AuthRequest,
  res: Response
) => {
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
};

export const getAllProductsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { page, limit } = req.query;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: "User not found",
    });
  }
  try {
    const products = await getAllProductsService(
      page as unknown as number,
      limit as unknown as number
    );
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get all products",
      error: (error as Error).message,
    });
  }
};

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
};

export const getProductByPostIdController = async (
  req: AuthRequest,
  res: Response
) => {
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
};

export const removeProductFromCartController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to remove product from cart",
      error: "User not found",
    });
  }
  const { productIds } = req.body;
  try {
    const cart = await removeProductsFromCartService(userId, productIds);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to remove product from cart",
      error: (error as Error).message,
    });
  }
};

export const createReviewProductController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to create review for product",
      error: "User not found",
    });
  }
  const { orderId, productId, ...reviewData } = req.body;
  try {
    const product = await createReviewProductService(
      orderId,
      userId,
      productId,
      reviewData
    );
    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create review for product",
      error: (error as Error).message,
    });
  }
};

export const searchProductsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to search products",
      error: "User not found",
    });
  }
  const { query, page, limit, filter } = req.query;
  try {
    const products = await searchProductsService(
      query as string,
      filter as unknown as string,
      page as unknown as number,
      limit as unknown as number
    );
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to search products",
      error: (error as Error).message,
    });
  }
};

export const createOrderController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to create order",
      error: "User not found",
    });
  }
  const { ...orderCreate } = req.body;
  try {
    const order = await createOrderService({ ...orderCreate, userId });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create order",
      error: (error as Error).message,
    });
  }
};

export const getOrdersByUserController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { page, limit, status } = req.query;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get orders",
      error: "User not found",
    });
  }
  try {
    const orders = await getOrdersByUserService(
      userId,
      page as unknown as number,
      limit as unknown as number,
      status as unknown as string
    );
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get orders",
      error: (error as Error).message,
    });
  }
};

export const getOrderOfSellerController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { page, limit, status } = req.query;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get orders",
      error: "User not found",
    });
  }
  try {
    const orders = await getOrderOfSellerService(
      userId,
      page as unknown as number,
      limit as unknown as number,
      status as unknown as string
    );
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get orders",
      error: (error as Error).message,
    });
  }
};

export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { orderId } = req.params;
  console.log("orderId", orderId);
  if (!userId) {
    return res.status(400).json({
      message: "Failed to get order",
      error: "User not found",
    });
  }
  try {
    const order = await getOrderByIdService(orderId);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get order",
      error: (error as Error).message,
    });
  }
};

export const cancelOrderController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { orderId, reason } = req.body;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to cancel order",
      error: "User not found",
    });
  }
  try {
    const order = await cancelOrderService(userId, orderId, reason);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to cancel order",
      error: (error as Error).message,
    });
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.authContent?.data.userId;
  const { orderId } = req.body;
  if (!userId) {
    return res.status(400).json({
      message: "Failed to update order status",
      error: "User not found",
    });
  }
  try {
    const order = await updateOrderStatusService(userId, orderId);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update order status",
      error: (error as Error).message,
    });
  }
};
