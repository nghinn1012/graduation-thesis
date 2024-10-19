import { Product, Review, ReviewCreate } from "../data/interface/product_interface";
import cartModel from "../models/cartModel";
import postModel from "../models/postModel";
import productModel from "../models/productModel";
import { IAuthor, rpcGetUsers } from "./rpc.services";

export const getAllProductsService = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const products = await productModel.find({
      quantity: { $gt: 0 },
    })
    .skip(skip)
    .limit(limit);

    const totalProducts = await productModel.countDocuments({
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

    return {
      products: productsWithPostInfo,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    throw new Error(`Failed to get all products: ${error}`);
  }
};


export const addProductToCartService = async (userId: string, productId: string, quantity: number) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      const newCart = await cartModel.create({
        userId,
        products: [{ productId, quantity }],
      });
      return newCart;
    }
    const productIndex = cart.products.findIndex((product) => product.productId.toString() === productId);
    if (productIndex === -1) {
      cart.products.push({ productId, quantity });
    } else {
      cart.products[productIndex].quantity += Number(quantity);
    }
    await cart.save();

    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productInfo = await productModel.findOne({ _id: product.productId });
        const postInfo = productInfo ? await postModel.findOne({ _id: productInfo?.postId }) : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    ) as unknown as Product[];

    const validProducts = products.filter(product => product.postInfo);

    const authors = await rpcGetUsers<IAuthor[]>(
      validProducts.map(product => product?.postInfo?.author || ""),
      ["_id", "name", "avatar", "username"]
    ) as IAuthor[];

    if (!authors) {
      throw new Error("Failed to fetch authors");
    }

    products.forEach((product) => {
      if (product.postInfo) {
        const author = authors.find((a) => a._id.toString() === product?.postInfo?.author.toString());
        if (author) {
          product.author = author;
        }
      }
    });
    return {
      ...cart.toObject(),
      products: products,
    };
  } catch (error) {
    throw new Error(`Failed to add product to cart: ${error}`);
  }
}

export const getCartService = async (userId: string) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return [];
    }

    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productInfo = await productModel.findOne({ _id: product.productId });
        const postInfo = productInfo ? await postModel.findOne({ _id: productInfo?.postId }) : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    ) as unknown as Product[];

    const validProducts = products.filter(product => product.postInfo);

    const authors = await rpcGetUsers<IAuthor[]>(
      validProducts.map(product => product?.postInfo?.author || ""),
      ["_id", "name", "avatar", "username"]
    ) as IAuthor[];

    if (!authors) {
      throw new Error("Failed to fetch authors");
    }

    products.forEach((product) => {
      if (product.postInfo) {
        const author = authors.find((a) => a._id.toString() === product?.postInfo?.author.toString());
        if (author) {
          product.author = author;
        }
      }
    });

    return products;
  } catch (error) {
    throw new Error(`Failed to get cart: ${error}`);
  }
}

export const getProductByPostIdService = async (postId: string) => {
  try {
    let product = await productModel.findOne({ postId });
    if (!product) {
      return null;
    }
    const productData = product.toObject() as unknown as Product;
    const reviewAuthors = await rpcGetUsers<IAuthor[]>(
      productData.reviews.map((review) => review.userId),
      ["_id", "name", "avatar"]
    );
    if (!reviewAuthors) {
      throw new Error("Failed to fetch review authors");
    }
    productData.reviews.forEach((review) => {
      const author = reviewAuthors.find((a) => a._id.toString() === review?.userId?.toString());
      if (author) {
        review.author = author;
      }
    }
    );
    const postInfo = await postModel.findOne({ _id: postId });
    return {
      ...productData,
      postInfo,
    };
  } catch (error) {
    throw new Error(`Failed to get product by post id: ${error}`);
  }
}

export const removeProductFromCartService = async (userId: string, productId: string) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    const productIndex = cart.products.findIndex((product) => product.productId.toString() === productId);
    if (productIndex === -1) {
      throw new Error("Product not found in cart");
    }
    cart.products.splice(productIndex, 1);
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Failed to remove product from cart: ${error}`);
  }
}

export const createReviewProductService = async (
  userId: string,
  productId: string,
  reviewData: ReviewCreate,
) => {
  try {
    const product = await productModel.findOne({ _id: productId });
    if (!product) {
      throw new Error("Product not found");
    }

    const newReview = {
      userId: userId,
      rating: reviewData.rating,
      review: reviewData.review,
    };

    product.reviews.push(newReview);
    product.averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

    await product.save();

    return product;
  } catch (error) {
    throw new Error(`Failed to create review for product: ${error}`);
  }
};

export const searchProductsService = async (query: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const matchingPosts = await postModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { about: { $regex: query, $options: 'i' } },
      ],
    }).lean();

    const postIds = matchingPosts.map(post => post._id);

    const products = await productModel.find({
      quantity: { $gt: 0 },
      postId: { $in: postIds },
    })
    .skip(skip)
    .limit(limit)
    .lean();

    console.log(products);

    const totalProducts = await productModel.countDocuments({
      quantity: { $gt: 0 },
      postId: { $in: postIds },
    });

    const productsWithPostInfo = await Promise.all(
      products.map(async (product) => {
        const postInfo = await postModel.findOne({ _id: product.postId }).lean();
        console.log(product);
        return {
          ...product,
          postInfo: postInfo,
        };
      })
    );

    return {
      products: productsWithPostInfo,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    console.error("Error in searchProductsService:", error);
    throw new Error(`Failed to search products: ${(error as Error).message}`);
  }
};
