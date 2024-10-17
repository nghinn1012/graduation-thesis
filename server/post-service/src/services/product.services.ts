import cartModel from "../models/cartModel";
import postModel from "../models/postModel";
import productModel from "../models/productModel";

export const getAllProductsService = async () => {
  try {
    const products = await productModel.find({
      quantity: { $gt: 0 },
    });

    const productsWithPostInfo = await Promise.all(
      products.map(async (product) => {
        const postInfo = await postModel.findOne({ _id: product.postId });
        return {
          ...product.toObject(),
          postInfo,
        };
      })
    );

    return productsWithPostInfo;
  } catch (error) {
    throw new Error(`Failed to get all products: ${error}`);
  }
};

export const addProductToCartService = async (userId: string, productId: string, quantity: number) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      await cartModel.create({
        userId,
        products: [{ productId, quantity }],
      });
      return;
    }
    const productIndex = cart.products.findIndex((product) => product.productId.toString() === productId);
    if (productIndex === -1) {
      cart.products.push({ productId, quantity });
    } else {
      cart.products[productIndex].quantity += Number(quantity);
    }
    await cart.save();
  } catch (error) {
    throw new Error(`Failed to add product to cart: ${error}`);
  }
}
