import axios from "axios";
import {
  OrderCreate,
  Product,
  Review,
  ReviewCreate,
} from "../data/interface/product_interface";
import cartModel from "../models/cartModel";
import orderModel from "../models/orderModel";
import postModel from "../models/postModel";
import productModel from "../models/productModel";
import { buildRequestBody, buildSignature, createSignature } from "../utlis/payment";
import { IAuthor, rpcGetUser, rpcGetUsers } from "./rpc.services";
import { MomoPaymentResponse, PaymentParams } from "../data/interface/payment_interface";
import crypto from 'crypto';

export const getAllProductsService = async (page: number, limit: number, userId: string) => {
  try {
    const skip = (page - 1) * limit;

    const products = await productModel.find({}).skip(skip).limit(limit);

    const totalProducts = await productModel.countDocuments({});

    const productsWithPostInfo = await Promise.all(
      products.map(async (product) => {
        const postInfo = await postModel.findOne({ _id: product.postId });
        return {
          ...product.toObject(),
          postInfo: postInfo,
        };
      })
    );
    console.log("productsWithPostInfo", productsWithPostInfo);

    const sortedProducts = productsWithPostInfo.sort((a, b) =>
      (a.postInfo?.author == userId) ? 1 : (b.postInfo?.author == userId) ? -1 : 0
    );

    return {
      products: sortedProducts,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    throw new Error(`Failed to get all products: ${error}`);
  }
};

export const addProductToCartService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      const newCart = await cartModel.create({
        userId,
        products: [{ productId, quantity }],
      });
      return newCart;
    }
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );
    if (productIndex === -1) {
      cart.products.push({ productId, quantity });
    } else {
      cart.products[productIndex].quantity += Number(quantity);
    }
    await cart.save();

    const products = (await Promise.all(
      cart.products.map(async (product) => {
        const productInfo = await productModel.findOne({
          _id: product.productId,
        });
        const postInfo = productInfo
          ? await postModel.findOne({ _id: productInfo?.postId })
          : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    )) as unknown as Product[];

    const validProducts = products.filter((product) => product.postInfo);

    const authors = (await rpcGetUsers<IAuthor[]>(
      validProducts.map((product) => product?.postInfo?.author || ""),
      ["_id", "name", "avatar", "username"]
    )) as IAuthor[];

    if (!authors) {
      throw new Error("Failed to fetch authors");
    }

    products.forEach((product) => {
      if (product.postInfo) {
        const author = authors.find(
          (a) => a._id.toString() === product?.postInfo?.author.toString()
        );
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
};

export const getCartService = async (userId: string) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return [];
    }

    const products = (await Promise.all(
      cart.products.map(async (product) => {
        const productInfo = await productModel.findOne({
          _id: product.productId,
        });
        const postInfo = productInfo
          ? await postModel.findOne({ _id: productInfo?.postId })
          : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    )) as unknown as Product[];

    const validProducts = products.filter((product) => product.postInfo);

    const authors = (await rpcGetUsers<IAuthor[]>(
      validProducts.map((product) => product?.postInfo?.author || ""),
      ["_id", "name", "avatar", "username"]
    )) as IAuthor[];

    if (!authors) {
      throw new Error("Failed to fetch authors");
    }

    products.forEach((product) => {
      if (product.postInfo) {
        const author = authors.find(
          (a) => a._id.toString() === product?.postInfo?.author.toString()
        );
        if (author) {
          product.author = author;
        }
      }
    });

    return products;
  } catch (error) {
    throw new Error(`Failed to get cart: ${error}`);
  }
};

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
      const author = reviewAuthors.find(
        (a) => a._id.toString() === review?.userId?.toString()
      );
      if (author) {
        review.author = author;
      }
    });
    const postInfo = await postModel.findOne({ _id: postId });
    return {
      ...productData,
      postInfo,
    };
  } catch (error) {
    throw new Error(`Failed to get product by post id: ${error}`);
  }
};

export const removeProductsFromCartService = async (
  userId: string,
  productIds: string[]
) => {
  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const updatedProducts = cart.products.filter(
      (product) => !productIds.includes(product.productId.toString())
    );

    cart.products.splice(0, cart.products.length, ...updatedProducts);

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Failed to remove products from cart: ${error}`);
  }
};

export const createReviewProductService = async (
  orderId: string,
  userId: string,
  reviewsData: ReviewCreate[]
) => {
  console.log("createReviewProductService", orderId, userId, reviewsData);
  try {
    reviewsData.forEach(reviewData => {
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error(`Rating for product ${reviewData.productId} must be between 1 and 5`);
      }
    });

    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "Completed") {
      throw new Error("Order is not completed yet");
    }

    if (userId !== order.userId) {
      throw new Error("User not authorized to review this product");
    }

    const orderProductIds = order.products.map(p => p.productId.toString());
    const invalidProducts = reviewsData.filter(
      review => !orderProductIds.includes(review.productId)
    );
    if (invalidProducts.length > 0) {
      throw new Error(
        `Products with IDs ${invalidProducts.map(p => p.productId).join(", ")} are not in this order`
      );
    }

    await Promise.all(
      reviewsData.map(async (reviewData) => {
        const productInfo = await productModel.findOne({
          _id: reviewData.productId,
        });
        if (!productInfo) {
          throw new Error(`Product with ID ${reviewData.productId} not found`);
        }

        const newReview = {
          userId,
          rating: reviewData.rating,
          review: reviewData.review,
          orderId: orderId,
          createdAt: new Date(),
        };

        productInfo.reviews.push(newReview);
        console.log("productInfo.reviews", productInfo.reviews);

        productInfo.averageRating =
          productInfo.reviews.reduce((acc, review) => acc + review.rating, 0) /
          productInfo.reviews.length;

        await productInfo.save();
      }),
    );
    order.isReviewed = true;
    await order.save();
    return order.toJSON();
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error(`Failed to create product reviews: ${error}`);
  }
};

export const searchProductsService = async (
  userId: string,
  query: string,
  filter: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;

    const matchingPosts = await postModel
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { about: { $regex: query, $options: "i" } },
        ],
      })
      .lean();

    const postIds = matchingPosts.map((post) => post._id);

    const allProducts = await productModel
      .find({
        quantity: { $gt: 0 },
        postId: { $in: postIds },
      })
      .lean();

    let productsWithPostInfo = await Promise.all(
      allProducts.map(async (product) => {
        const postInfo = await postModel
          .findOne({ _id: product.postId })
          .lean();
        return {
          ...product,
          postInfo: postInfo,
        };
      })
    );

    productsWithPostInfo = productsWithPostInfo.sort((a, b) =>
      (a.postInfo?.author == userId) ? 1 : (b.postInfo?.author == userId) ? -1 : 0
    );


    let filteredProducts = productsWithPostInfo.filter((product) => {
      if (filter === "") {
        return true;
      }
      return product.postInfo?.course?.includes(filter.toLowerCase());
    });

    const totalFilteredProducts = filteredProducts.length;

    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    return {
      products: paginatedProducts,
      total: totalFilteredProducts,
      page,
      totalPages: Math.ceil(totalFilteredProducts / limit),
    };
  } catch (error) {
    console.error("Error in searchProductsService:", error);
    throw new Error(`Failed to search products: ${(error as Error).message}`);
  }
};

export const createOrderService = async (orderCreate: OrderCreate) => {
  try {
    if (!orderCreate.products || orderCreate.products.length === 0) {
      throw new Error("Products not found");
    }
    const newOrder = await orderModel.create(orderCreate);
    orderCreate.products.forEach(async (product) => {
      const productInfo = await productModel.findOne({
        _id: product.productId,
      });
      if (!productInfo) {
        throw new Error("Product not found");
      }
      if (product.quantity > productInfo.quantity) {
        throw new Error("Product quantity is not enough");
      }
      productInfo.quantity -= product.quantity;
      await productInfo.save();
    });
    const productsWithInfo = await Promise.all(
      newOrder.products.map(async (product) => {
        const productInfo = await productModel.findOne({
          _id: product.productId,
        });
        const postInfo = productInfo
          ? await postModel.findOne({ _id: productInfo.postId })
          : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    );

    const userInfo = await rpcGetUser<IAuthor>(newOrder.userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    const sellerInfo = await rpcGetUser<IAuthor>(newOrder.sellerId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);

    return {
      ...newOrder.toObject(),
      products: productsWithInfo,
      userInfo,
      sellerInfo,
    };
  } catch (error) {
    throw new Error(`Failed to create order: ${error}`);
  }
};

export const getOrdersByUserService = async (
  userId: string,
  page: number,
  limit: number,
  status: string
) => {
  try {
    const skip = (page - 1) * limit;
    console.log(userId, page, limit, status);

    const query: any = { userId };

    if (status !== "") {
      query.status = status;
    }

    const orders = await orderModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log("orders", orders);

    const total = await orderModel.countDocuments(query);
    const result = await Promise.all(
      orders.map(async (order) => {
        const productsWithInfo = await Promise.all(
          order.products.map(async (product) => {
            const productInfo = await productModel.findOne({
              _id: product.productId,
            });
            const postInfo = productInfo
              ? await postModel.findOne({ _id: productInfo.postId })
              : null;

            return {
              ...product.toObject(),
              productInfo,
              postInfo,
            };
          })
        );

        return {
          ...order.toObject(),
          products: productsWithInfo,
        };
      })
    );

    return {
      orders: result,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Failed to get orders by user: ${error}`);
  }
};

export const getOrderOfSellerService = async (
  sellerId: string,
  page: number,
  limit: number = 10,
  status: string
) => {
  try {
    const skip = (page - 1) * limit;

    const query: any = { sellerId };

    if (status !== "") {
      query.status = status;
    }

    const orders = await orderModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await orderModel.countDocuments(query); // Count based on the query

    const result = await Promise.all(
      orders.map(async (order) => {
        const productsWithInfo = await Promise.all(
          order.products.map(async (product) => {
            const productInfo = await productModel.findOne({
              _id: product.productId,
            });
            const postInfo = productInfo
              ? await postModel.findOne({ _id: productInfo.postId })
              : null;

            return {
              ...product.toObject(),
              productInfo,
              postInfo,
            };
          })
        );

        return {
          ...order.toObject(),
          products: productsWithInfo,
        };
      })
    );

    return {
      orders: result,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Failed to get order of seller: ${error}`);
  }
};

export const getOrderByIdService = async (orderId: string) => {
  try {
    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    const productsWithInfo = await Promise.all(
      order.products.map(async (product) => {
        const productInfo = await productModel.findOne({
          _id: product.productId,
        });
        const postInfo = productInfo
          ? await postModel.findOne({ _id: productInfo.postId })
          : null;

        return {
          ...product.toObject(),
          productInfo,
          postInfo,
        };
      })
    );

    const userInfo = await rpcGetUser<IAuthor>(order.userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    const sellerInfo = await rpcGetUser<IAuthor>(order.sellerId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);

    return {
      ...order.toObject(),
      products: productsWithInfo,
      userInfo,
      sellerInfo,
    };
  } catch (error) {
    throw new Error(`Failed to get order by id: ${error}`);
  }
};

export const cancelOrderService = async (
  userId: string,
  orderId: string,
  reason: string
) => {
  try {
    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId && userId !== order.sellerId) {
      throw new Error("User not authorized to cancel this order");
    }

    if (order.status !== "Pending") {
      throw new Error("Order cannot be canceled");
    }

    order.status =
      userId === order.userId ? "Cancelled By User" : "Cancelled By Seller";
    order.reason = reason;
    await order.save();
    return order;
  } catch (error) {
    throw new Error(`Failed to cancel order: ${error}`);
  }
};

export const updateOrderStatusService = async (
  userId: string,
  orderId: string
) => {
  try {
    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.sellerId !== userId) {
      throw new Error("User not authorized to update this order");
    }

    if (
      order.status === "Cancelled By User" ||
      order.status === "Cancelled By Seller"
    ) {
      throw new Error("Order is already cancelled");
    }

    if (order.status === "Delivering") {
      order.status = "Completed";
    } else if (order.status === "Pending") {
      order.status = "Delivering";
    }

    await order.save();
    return order;
  } catch (error) {
    throw new Error(`Failed to update order status: ${error}`);
  }
};

export const createMomoPaymentService = async ({
  orderId,
  amount,
  redirectUrl
}: PaymentParams): Promise<MomoPaymentResponse> => {
  const config = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    ipnUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
    requestType: "payWithMethod",
    orderInfo: 'Đơn hàng mua hàng trên website',
  };

  const requestData = {
    partnerCode: config.partnerCode,
    requestId: orderId,
    amount: amount,
    orderId: orderId,
    orderInfo: config.orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: config.ipnUrl,
    requestType: config.requestType,
    extraData: '',
    lang: 'vi'
  };

  const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${requestData.extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${config.orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=${config.requestType}`;
  const signature = crypto.createHmac('sha256', config.secretKey).update(rawSignature).digest('hex');

  const { data } = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', {
    ...requestData,
    partnerName: "Test",
    storeId: "MomoTestStore",
    signature: signature
  });

  return data;
};
