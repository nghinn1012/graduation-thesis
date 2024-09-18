import { InternalError } from "../data";
import { createComment } from "../data/interface/comment_interface";
import CommentModel from "../models/commentModel";
import { IAuthor, Id, rpcGetUser, rpcGetUsers } from "./rpc.services";

export const createCommentService = async (postId: string, userId: string, commentData: createComment) => {
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

// export const getCommentByPostIdService = async (postId: string) => {
//     try {
//         const comments = await CommentModel.find({ postId });

//         const authors = await rpcGetUsers<IAuthor[]>(
//             comments.map(comment => comment.userId),
//             ["_id", "email", "name", "avatar", "username"]
//         );
//         if (!authors) {
//             console.log("rpc-author", "unknown");
//             throw new InternalError({
//                 data: {
//                     target: "rpc-author",
//                     reason: "unknown",
//                 },
//             });
//         };
//         const uniqueUserMentions = Array.from(new Set(comments
//             .map(comment => comment.userMention)
//             .filter(userMention => userMention !== null)
//         )) as string[];

//         // Lấy thông tin cho các userMention từ RPC
//         const userMentions = await rpcGetUsers<IAuthor[]>(
//             uniqueUserMentions,
//             ["_id", "name", "avatar", "username"]
//         );
//         const commentPromises = comments.map(async (comment) => {
//             let userMention: IAuthor | null = null;

//             if (comment.userMention) {
//                 const userMentionResult = await rpcGetUser<IAuthor>(comment.userMention, ["_id", "name", "avatar", "username"]);
//                 userMention = userMentionResult || null;
//             }

//             return {
//                 ...comment.toObject(),
//                 author: authors.find(author => author._id === comment.userId) || null,
//                 userMention: userMention,
//                 replies: []
//             };
//         });

//         const commentWithAuthors = await Promise.all(commentPromises);

//         const commentsMap = new Map<string, any>();
//         const rootComments: any[] = [];

//         commentWithAuthors.forEach(comment => {
//             commentsMap.set(comment._id.toString(), comment);
//         });

//         commentWithAuthors.forEach(comment => {
//             if (comment.parentCommentId) {
//                 const parentComment = commentsMap.get(comment.parentCommentId.toString());
//                 if (parentComment) {
//                     parentComment.replies.push(comment);
//                 }
//             } else {
//                 rootComments.push(comment);
//             }
//         });

//         return rootComments;
//     } catch (error) {
//         throw error;
//     }
// };

export const getCommentByPostIdService = async (postId: string) => {
    try {
        // Lấy tất cả comments
        const comments = await CommentModel.find({ postId });

        // Lấy thông tin các tác giả cho tất cả userId
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

        // Lọc các userMention không phải là null và tạo một danh sách duy nhất
        const uniqueUserMentions = Array.from(new Set(comments
            .map(comment => comment.userMention)
            .filter(userMention => userMention !== null) as string[]
        ));
        console.log(uniqueUserMentions);

        // Lấy thông tin cho các userMention từ RPC
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

        // Tạo map cho userMention để dễ dàng truy cập
        const userMentionMap = new Map<string, IAuthor | null>();
        userMentions.forEach(userMention => {
            if (userMention) {
                userMentionMap.set(userMention._id, userMention);
            }
        });

        // Duyệt qua từng comment để tạo danh sách các comment với thông tin đầy đủ
        const commentWithAuthors = comments.map((comment) => {
            const userMention = comment.userMention ? userMentionMap.get(comment.userMention) || null : null;

            return {
                ...comment.toObject(),
                author: authors.find(author => author._id === comment.userId) || null,
                userMention: userMention,
                replies: []
            };
        });

        // Tạo map để tổ chức comment theo ID
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
        console.log(userId)
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
        const comment = await CommentModel.findByIdAndDelete(commentId);
        return comment;
    }
    catch (error) {
        throw error;
    }
}
