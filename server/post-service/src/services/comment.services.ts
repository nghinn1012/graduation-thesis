import { createComment } from "../data/interface/comment_interface";
import CommentModel from "../models/commentModel";

export const createCommentService = async (postId: string, userId: string, commentData: createComment) => {
    try {
        const comment = await CommentModel.create({
            ...commentData,
            postId,
            userId,
        });
        return comment;
    }
    catch (error) {
        throw error;
    }
}

export const getCommentByPostIdService = async (postId: string) => {
    try {
        const comments = await CommentModel.find({ postId });
        return comments;
    }
    catch (error) {
        throw error;
    }
}

export const getCommentByIdService = async (commentId: string) => {
    try {
        const comment = await CommentModel.findById(commentId);
        return comment;
    }
    catch (error) {
        throw error;
    }
}
