import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";
import { AccountInfo, DashboardStats, OrderStats } from "../data/interface/post_create_interface";
import complaintModel from "../models/complaintModel";
import orderModel from "../models/orderModel";
import postModel from "../models/postModel";
import productModel from "../models/productModel";
import {
  notifySendReport,
  notifySendReportCountUpdate,
  notifySendReportUpdate,
} from "./notify.services";
import { rpcGetUser, rpcGetUsers } from "./rpc.services";

export const createComplaintService = async (
  postId: string,
  userId: string,
  reason: string,
  description: string
) => {
  try {
    console.log(postId, userId, reason, description);
    const post = await postModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const author = await rpcGetUser<AccountInfo>(userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    if (!author) {
      throw new Error("User not found");
    }

    const newComplaint = new complaintModel({
      postId,
      userId,
      reason,
      description,
    });
    await newComplaint.save();
    await notifySendReport(author, {
      _id: post._id.toString(),
      title: post.title,
      image: post.images[0],
    });
    return newComplaint;
  } catch (error) {
    throw new Error("Error creating complaint: " + (error as Error).message);
  }
};

export const getComplaintsService = async () => {
  try {
    const complaints = await complaintModel
      .find()
      .sort({ createdAt: -1 });

    const complaintsWithPostInfo = await Promise.all(
      complaints.map(async (complaint) => {
        const post = await postModel.findById(complaint.postId);
        if (!post || post.isDeleted) {
          return {
            ...complaint.toJSON(),
            post: {
              _id: "deleted",
              title: "Deleted",
            },
          };
        }
        return {
          ...complaint.toJSON(),
          post,
        };
      })
    );

    const userIds = [...new Set(complaintsWithPostInfo.map(complaint => complaint.userId))];

    const users = await rpcGetUsers<AccountInfo[]>(userIds, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);

    if (!users) {
      throw new Error("Failed to fetch users");
    }

    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {} as Record<string, AccountInfo>);

    const complaintsWithUserInfo = complaintsWithPostInfo.map(complaint => ({
      ...complaint,
      user: userMap[complaint.userId] || null,
    }));

    return complaintsWithUserInfo;
  } catch (error) {
    throw new Error("Error getting complaints: " + (error as Error).message);
  }
};

export const updateComplaintService = async (
  userId: string,
  complaintId: string,
  status: string
) => {
  try {
    const user = await rpcGetUser<AccountInfo>(userId, [
      "_id",
      "role",
    ]);
    if (!user || user.role !== "admin") {
      throw new Error("Permission denied");
    }
    const complaint = await complaintModel.findById(complaintId);
    if (!complaint) {
      throw new Error("Complaint not found");
    }
    const complaintAuthor = await rpcGetUser<AccountInfo>(complaint.userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    if (!complaintAuthor) {
      throw new Error("Complaint author not found");
    }
    if (complaint.status === "resolved" || complaint.status === "rejected") {
      throw new Error("Complaint already resolved or rejected");
    }

    complaint.status = status as any;
    const post = await postModel.findById(complaint.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (status === "resolved") {
      post.isDeleted = true;
      await post.save();
      await notifySendReportCountUpdate(post.author);
    }
    await notifySendReportUpdate(complaintAuthor, {
      _id: post._id.toString(),
      title: post.title,
      image: post.images[0],
      accepted: status === "resolved",
    });
    await complaint.save();
    return complaint;
  } catch (error) {
    throw new Error("Error updating complaint: " + (error as Error).message);
  }
};

export const getDashboardStatisticsService = async (): Promise<DashboardStats> => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const calculateStats = async (startDate: Date): Promise<OrderStats> => {
    const [totalOrders, successfulOrders] = await Promise.all([
      orderModel.countDocuments({
        createdAt: { $gte: startDate }
      }),
      orderModel.countDocuments({
        createdAt: { $gte: startDate },
        status: 'Completed'
      })
    ]);

    const percentage = totalOrders > 0
      ? Math.round((successfulOrders / totalOrders) * 100)
      : 0;

    return {
      total: totalOrders,
      successful: successfulOrders,
      percentage
    };
  };

  const [daily, weekly, monthly] = await Promise.all([
    calculateStats(startOfDay),
    calculateStats(startOfWeek),
    calculateStats(startOfMonth)
  ]);

  const [totalPosts, totalProducts, totalOrders] = await Promise.all([
    postModel.countDocuments(),
    productModel.countDocuments(),
    orderModel.countDocuments()
  ]);

  return {
    orderAnalytics: {
      daily,
      weekly,
      monthly
    },
    totalStats: {
      totalPosts,
      totalProducts,
      totalOrders
    }
  };
};
