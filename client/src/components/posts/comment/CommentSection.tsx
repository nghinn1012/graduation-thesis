import React, { useState, useEffect, useRef } from "react";
import { Comment, CommentAuthor, postFetcher } from "../../../api/post";
import { formatDistanceToNow } from "date-fns";
import CommentSkeleton from "../../skeleton/CommentSkeleton";
import * as yup from "yup";
import { FaHeart as FaHeartSolid } from "react-icons/fa";
import { usePostContext } from "../../../context/PostContext";
interface CommentSectionProps {
  postId: string;
  token: string;
  author: CommentAuthor;
}

const commentSchema = yup.object().shape({
  content: yup.string().trim().required("Comment content is required"),
});

const CommentSection: React.FC<CommentSectionProps> = ({
  author,
  postId,
  token,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [userMention, setUserMention] = useState<CommentAuthor>(
    {} as CommentAuthor
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [editCommentError, setEditCommentError] = useState<string | null>(null);
  const [newCommentError, setNewCommentError] = useState<string | null>(null);
  const {postCommentCounts, updateCommentCount} = usePostContext();

  const getTotalCommentCount = (comments: Comment[]): number => {
    let count = comments.length;

    const countReplies = (replies: Comment[] | undefined): number => {
      let replyCount = replies ? replies.length : 0;
      for (const reply of replies || []) {
        replyCount += countReplies(reply.replies);
      }
      return replyCount;
    };

    for (const comment of comments) {
      count += countReplies(comment.replies);
    }

    return count;
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!token) {
        return;
      }
      setLoading(true);
      try {
        const response = (await postFetcher.getCommentByPostId(
          postId,
          token
        )) as unknown as Comment[];
        setComments(response);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, token]);

  const toggleReplies = (commentId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyClick = (
    userMention: CommentAuthor,
    commentId: string,
    parentCommentId?: string
  ) => {
    setParentCommentId(parentCommentId || commentId);
    setUserMention(userMention);
    inputRef.current?.focus();
  };

  const handlePostComment = async () => {
    setNewCommentError(null);
    const createData = {
      content: newComment,
      userMention: userMention._id,
      parentCommentId,
    };

    try {
      await commentSchema.validate(createData);
      const response = (await postFetcher.createComment(
        postId,
        createData,
        token
      )) as unknown as Comment;
      updateCommentCount(postId, getTotalCommentCount(comments) + 1);
      response.author = author;
      response.userMention = userMention ? userMention : ({} as CommentAuthor);
      if (parentCommentId) {
        setComments((prev) => {
          const newComments = prev.map((comment) => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response],
              };
            }
            return comment;
          });
          return newComments;
        });
      } else {
        setComments([...comments, response]);
      }
      console.log(postCommentCounts[postId]);
      setNewComment("");
      setParentCommentId(null);
      setUserMention({} as CommentAuthor);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setNewCommentError(error.message);
      } else {
        console.error("Failed to post comment", error);
      }
    }
  };

  const handleUpdateComment = async () => {
    setEditCommentError(null);
    const updateData = {
      content: editContent,
      userMention: userMention?._id || null,
    };

    try {
      await commentSchema.validate(updateData);

      await postFetcher.updateComment(
        editingCommentId as string,
        updateData,
        token
      );

      setComments((prev) => {
        const updatedComments = prev.map((comment) => {
          if (comment._id === editingCommentId) {
            return {
              ...comment,
              content: editContent,
              userMention: userMention ? userMention : ({} as CommentAuthor),
            };
          }

          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map((reply) =>
              reply._id === editingCommentId
                ? {
                    ...reply,
                    content: editContent,
                    userMention: userMention
                      ? userMention
                      : ({} as CommentAuthor),
                  }
                : reply
            );

            if (updatedReplies !== comment.replies) {
              return { ...comment, replies: updatedReplies };
            }
          }

          return comment;
        });

        return updatedComments;
      });

      setEditingCommentId(null);
      setEditContent("");
      setUserMention({} as CommentAuthor);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setEditCommentError(error.message);
      } else {
        console.error("Failed to update comment", error);
      }
    }
  };

  const handleRemoveUserMention = () => {
    setUserMention({} as CommentAuthor);
  };

  const handleDeleteComment = async (
    commentId: string,
    parentCommentId?: string
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

    try {
      await postFetcher.deleteComment(commentId, token);
      updateCommentCount(postId, getTotalCommentCount(comments) - 1);
      setComments((prev) => {
        if (parentCommentId) {
          return prev.map((comment) => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: comment.replies?.filter(
                  (reply) => reply._id !== commentId
                ),
              };
            }
            return comment;
          });
        } else {
          return prev.filter((comment) => comment._id !== commentId);
        }
      });
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const toggleLike = async (commentId: string) => {
    try {
      const likedComment = await postFetcher.likeOrUnlikeComment(
        commentId,
        token
      );
      console.log(likedComment);

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            const newData = {
              ...likedComment,
              replies: comment.replies,
            };
            return newData as unknown as Comment;
          }
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map((reply) =>
              reply._id === commentId
                ? (likedComment as unknown as Comment)
                : reply
            );
            if (updatedReplies !== comment.replies) {
              return {
                ...comment,
                replies: updatedReplies,
                userMention: comment.userMention,
              };
            }
          }
          return comment;
        })
      );
      console.log(comments);
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const renderReplies = (replies: Comment[] = [], parentCommentId: string) => (
    <div className="ml-4 mt-2 space-y-3">
      {replies.map((reply) => (
        <div key={reply._id} className="flex items-start space-x-3 mr-0">
          <img
            src={reply.author.avatar || "/boy1.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 pl-3 py-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-1">
                    <span className="font-semibold">{reply.author.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}{" "}
                  </span>
                </div>
                <button
                  onClick={() => toggleLike(reply._id)}
                  className="flex items-center"
                >
                  <FaHeartSolid
                    className={`cursor-pointer ${
                      reply.likes.includes(author._id)
                        ? "text-red-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="ml-2">{reply.likes.length}</span>
                </button>
              </div>
            </div>
            {editingCommentId === reply._id ? (
              <>
                {userMention &&
                  userMention._id &&
                  editingCommentId &&
                  userMention?.username != undefined && (
                    <div className="mb-4 text-gray-500 flex items-center">
                      <span className="mr-2">
                        Replying to{" "}
                        <span className="font-semibold">
                          @{userMention.username}
                        </span>
                      </span>
                      <button
                        onClick={handleRemoveUserMention}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                <div className="mb-4 flex items-center border-b border-gray-200 pb-3">
                  <input
                    type="text"
                    placeholder="Edit comment"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input input-bordered w-full rounded-md border-gray-300"
                  />
                  <button
                    onClick={handleUpdateComment}
                    className="ml-3 btn btn-primary"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditContent("");
                    }}
                    className="ml-3 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
                {editCommentError && (
                  <p className="text-red-500 text-sm">{editCommentError}</p>
                )}
              </>
            ) : (
              <p className="mt-1">
                {reply.userMention && (
                  <a
                    href={`/profile/${reply.userMention._id}`}
                    className="text-blue-500 hover:underline mr-1"
                  >
                    {reply.userMention.username &&
                      `@${reply.userMention.username}`}
                  </a>
                )}
                {reply.content}
              </p>
            )}
            {reply.author._id === author._id && !editingCommentId && (
              <>
                <button
                  className="mr-4 text-blue-500 hover:underline text-xs mt-2"
                  onClick={() => {
                    setEditingCommentId(reply._id);
                    setEditContent(reply.content);
                    setUserMention(
                      reply.userMention as unknown as CommentAuthor
                    );
                  }}
                >
                  Edit
                </button>
                <button
                  className="mr-4 text-red-500 hover:underline text-xs mt-2"
                  onClick={() =>
                    handleDeleteComment(reply._id, parentCommentId)
                  }
                >
                  Delete
                </button>
              </>
            )}

            <button
              className="mr-4 text-blue-500 hover:underline text-xs mt-2"
              onClick={() =>
                handleReplyClick(
                  reply.author,
                  reply._id.toString(),
                  parentCommentId
                )
              }
            >
              Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-5 bg-white shadow-md rounded-lg">
      {userMention?._id &&
        !editingCommentId &&
        userMention.username != undefined && (
          <div className="mb-4 text-gray-500 flex items-center">
            <span className="mr-2">
              Replying to{" "}
              <span className="font-semibold">@{userMention.username}</span>
            </span>
            <button
              onClick={handleRemoveUserMention}
              className="text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        )}
      {/* Comment Input */}
      <div className="mb-4 flex items-center border-b border-gray-200 pb-3">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center justify-between">
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment"
              disabled={editingCommentId !== null}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input input-bordered w-full rounded-md border-gray-300"
            />
            <button
              onClick={handlePostComment}
              className="ml-3 btn btn-primary"
            >
              Post
            </button>
          </div>
          {newCommentError && (
            <p className="text-red-500 text-sm">{newCommentError}</p>
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <CommentSkeleton />}

      {/* Comments */}
      {!loading && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex flex-col space-y-3">
              <div className="flex items-start space-x-3 border-b border-gray-200 pb-3">
                <img
                  src={comment.author.avatar || "/boy1.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex flex-row">
                          <span className="font-semibold">
                            {comment.author.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleLike(comment._id)}
                        className="flex items-center"
                      >
                        <FaHeartSolid
                          className={`cursor-pointer ${
                            comment.likes.includes(author._id)
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="ml-2">{comment.likes.length}</span>
                      </button>
                    </div>
                  </div>
                  {editingCommentId === comment._id ? (
                    <>
                      {userMention && userMention.username != undefined && (
                        <div className="mb-4 text-gray-500 flex items-center">
                          <span className="mr-2">
                            Replying to{" "}
                            <span className="font-semibold">
                              @{userMention?.username}
                            </span>
                          </span>
                          <button
                            onClick={handleRemoveUserMention}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <div className="mb-4 flex items-center border-b border-gray-200 pb-3">
                        <input
                          type="text"
                          placeholder="Edit comment"
                          value={editContent}
                          onChange={(e) => {
                            setEditContent(e.target.value);
                          }}
                          className="input input-bordered w-full rounded-md border-gray-300"
                        />
                        <button
                          onClick={handleUpdateComment}
                          className="ml-3 btn btn-primary"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent("");
                            setUserMention({} as CommentAuthor);
                          }}
                          className="ml-3 btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                      {editCommentError && (
                        <p className="text-red-500 text-sm">
                          {editCommentError}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1">
                      {comment.userMention && (
                        <a
                          href={`/profile/${comment.userMention._id}`}
                          className="text-blue-500 hover:underline mr-1"
                        >
                          {comment.userMention.username &&
                            `@${comment.userMention.username}`}
                        </a>
                      )}
                      {comment.content}
                    </p>
                  )}

                  {comment.author._id === author._id && !editingCommentId && (
                    <>
                      <button
                        className="mr-4 text-blue-500 hover:underline text-xs mt-2"
                        onClick={() => {
                          setEditingCommentId(comment._id);
                          setEditContent(comment.content);
                          setUserMention(
                            comment.userMention as unknown as CommentAuthor
                          );
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="mr-4 text-red-500 hover:underline text-xs mt-2"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  <button
                    className="mr-4 text-blue-500 hover:underline text-xs mt-2"
                    onClick={() =>
                      handleReplyClick(comment.author, comment._id.toString())
                    }
                  >
                    Reply
                  </button>
                  {comment.replies && comment.replies.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleReplies(comment._id.toString())}
                        className="text-blue-500 hover:underline mt-2 text-xs"
                      >
                        {openReplies[comment._id]
                          ? "Hide replies"
                          : "Show replies"}
                      </button>
                      {openReplies[comment._id] &&
                        renderReplies(comment.replies, comment._id.toString())}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
