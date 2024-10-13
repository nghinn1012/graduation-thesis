import { InternalError } from "../data";
import { createComment } from "../data/interface/comment_interface";
import CommentModel from "../models/commentModel";
import { IAuthor, Id, rpcGetUser, rpcGetUsers } from "./rpc.services";
import PostModel from "../models/postModel";
import { notifyCommentedFood } from "./notify.services";
export const createCommentService = async (postId: string, userId: string, commentData: createComment) => {
    const author = await rpcGetUser<IAuthor>(userId, ["_id", "name", "username", "avatar"]);
    if (!author) {
        console.log("rpc-author", "unknown");
        throw new InternalError({
            data: {
                target: "rpc-author",
                reason: "unknown",
            },
        });
    }
    try {
        const comment = await CommentModel.create({
            ...commentData,
            postId,
            userId,
        });
        const postData = await PostModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
        if (!postData) {
            throw new InternalError({
                data: {
                    target: "post",
                    reason: "not-found",
                },
            });
        }
        await notifyCommentedFood(author,
        {
            _id: postId,
            title: postData.title,
            image: postData.images[0],
        }, postData.author, commentData.userMention);
        return comment;
    }
    catch (error) {
        throw error;
    }
}

export const getCommentByPostIdService = async (postId: string) => {
    try {
        const comments = await CommentModel.find({ postId });

        const authors = await rpcGetUsers<IAuthor[]>(
            comments.map(comment => comment.userId),
            ["_id", "email", "name", "avatar", "username"]
        );

        if (!authors) {
            console.log("rpc-author", "unknown");
            throw new InternalError({
                data: {
                    target: "rpc-author",
                    reason: "unknown",
                },
            });
        }

        const uniqueUserMentions = Array.from(new Set(comments
            .map(comment => comment.userMention)
            .filter(userMention => userMention !== null) as string[]
        ));

        const userMentions = await rpcGetUsers<IAuthor[]>(
            uniqueUserMentions,
            ["_id", "name", "avatar", "username"]
        );
        if (!userMentions) {
            console.log("rpc-author", "unknown");
            throw new InternalError({
                data: {
                    target: "rpc-author mention",
                    reason: "unknown",
                },
            });
        };

        const userMentionMap = new Map<string, IAuthor | null>();
        userMentions.forEach(userMention => {
            if (userMention) {
                userMentionMap.set(userMention._id, userMention);
            }
        });

        const commentWithAuthors = comments.map((comment) => {
            const userMention = comment.userMention ? userMentionMap.get(comment.userMention) || null : null;

            return {
                ...comment.toObject(),
                author: authors.find(author => author._id === comment.userId) || null,
                userMention: userMention,
                replies: []
            };
        });

        const commentsMap = new Map<string, any>();
        const rootComments: any[] = [];

        commentWithAuthors.forEach(comment => {
            commentsMap.set(comment._id.toString(), comment);
        });

        commentWithAuthors.forEach(comment => {
            if (comment.parentCommentId) {
                const parentComment = commentsMap.get(comment.parentCommentId.toString());
                if (parentComment) {
                    parentComment.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    } catch (error) {
        throw error;
    }
};

export const getCommentByIdService = async (commentId: string) => {
    try {
        const comment = await CommentModel.findById(commentId);
        return comment;
    }
    catch (error) {
        throw error;
    }
}

export const updateCommentService = async (userId: string, commentId: string, commentData: createComment) => {
    try {
        const author = await rpcGetUser<Id>(userId, "_id");
        if (!author) {
            console.log("rpc-author", "unknown");
            throw new InternalError({
                data: {
                    target: "rpc-author",
                    reason: "unknown",
                },
            });
        }
        const currentComment = await CommentModel.findById(commentId);
        if (!currentComment) {
            throw new InternalError({
                data: {
                    target: "comment",
                    reason: "not-found",
                },
            });
        }
        if (currentComment.userId && currentComment.userId !== userId) {
            console.log("rpc-author", "unauthorized");
            throw new InternalError({
                data: {
                    target: "rpc-author",
                    reason: "unauthorized",
                },
            });
        }
        const comment = await CommentModel.findByIdAndUpdate(commentId, commentData, { new: true });
        return comment;
    }
    catch (error) {
        throw error;
    }
}

export const deleteCommentService = async (userId: string, commentId: string) => {
    try {
        const author = await rpcGetUser<Id>(userId, "_id");
        if (!author) {
            console.log("rpc-author", "unknown");
            throw new InternalError({
                data: {
                    target: "rpc-author",
                    reason: "unknown",
                },
            });
        }
        const currentComment = await CommentModel.findById(commentId);
        if (!currentComment) {
            throw new InternalError({
                data: {
                    target: "comment",
                    reason: "not-found",
                },
            });
        }
        if (currentComment.userId && currentComment.userId !== userId) {
            console.log("rpc-author", "unauthorized");
            throw new InternalError({
                data: {
                    target: "rpc-author",
                    reason: "unauthorized",
                },
            });
        }
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            throw new InternalError({
                data: {
                    target: "comment",
                    reason: "not-found",
                },
            });
        }
        await PostModel.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
        await CommentModel.findByIdAndDelete(commentId);
        return comment;
    }
    catch (error) {
        throw error;
    }
}

export const likeOrUnlikeCommentService = async (userId: string, commentId: string) => {
    try {
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            throw new InternalError({
                data: {
                    target: "comment",
                    reason: "not-found",
                },
            });
        }
        const isLiked = comment.likes.includes(userId);
        if (isLiked) {
            comment.likes = comment.likes.filter(like => like !== userId);
        } else {
            comment.likes.push(userId);
        }
        await comment.save();
        const author = await rpcGetUser<Id>(comment.userId, ["_id", "name", "avatar", "username"]);
        const userMention = comment.userMention ? await rpcGetUser<Id>(comment.userMention, ["_id", "username"]) : null;
        const returnComment = {
            ...comment.toObject(),
            author,
            userMention,
        };
        return returnComment;
    }
    catch (error) {
        throw error;
    }
}
