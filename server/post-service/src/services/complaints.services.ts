import { AccountInfo } from "../data/interface/post_create_interface";
import complaintModel from "../models/complaintModel";
import postModel from "../models/postModel";
import { notifySendReport } from "./notify.services";
import { rpcGetUser } from "./rpc.services";

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

export const getComplaintsService = async (page: number, pageSize: number) => {
  try {
    const complaints = await complaintModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
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
          post
        };
      })
    );
    const complaintsWithUserInfo = await Promise.all(
      complaintsWithPostInfo.map(async (complaint) => {
        const user = await rpcGetUser<AccountInfo>(complaint.userId, [
          "_id",
          "name",
          "avatar",
          "username",
        ]);
        return {
          ...complaint,
          user,
        };
      })
    );
    return {
      complaints: complaintsWithUserInfo,
      total: await complaintModel.countDocuments(),
      totalPage: Math.ceil(await complaintModel.countDocuments() / pageSize),
    };
  } catch (error) {
    throw new Error("Error getting complaints: " + (error as Error).message);
  }
}

export const updateComplaintService = async (userId: string, complaintId: string, status: string) => {
  try {
    const user = await rpcGetUser<AccountInfo>(userId, ["_id", "role"]);
    if (!user || user.role !== "admin") {
      throw new Error("Permission denied");
    }
    const complaint = await complaintModel.findById(complaintId);
    if (!complaint) {
      throw new Error("Complaint not found");
    }
    if (complaint.status === "resolved") {
      throw new Error("Complaint already resolved");
    }

    complaint.status = status as any;
    if (status === "resolved") {
      const post = await postModel.findById(complaint.postId);
      if (!post) {
        throw new Error("Post not found");
      }
      post.isDeleted = true;
      await post.save();
    }
    await complaint.save();
    return complaint;
  } catch (error) {
    throw new Error("Error updating complaint: " + (error as Error).message);
  }
}
