import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import { UserInfo } from "os";
import { AccountInfo, userFetcher, UserResponse } from "../../api/user";
import { useAuthContext } from "../../hooks/useAuthContext";

interface Ingredient {
  name: string;
  quantity: string;
}

interface Instruction {
  step: number;
  description: string;
  image?: string;
}

interface PostProps {
  post: {
    _id: string;
    title: string;
    author: string;
    images: string[];
    hashtags: string[];
    timeToTake: number;
    servings: number;
    ingredients: Ingredient[];
    instructions: Instruction[];
    createdAt: string;
    updatedAt: string;
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [comment, setComment] = useState<string>("");

  const [postAuthor, setPostAuthor] = useState<AccountInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isLiked = false;
  const isMyPost = true;
  const formattedDate = "1h";
  const isCommenting = false;

  const handleDeletePost = () => {};
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleLikePost = () => {};

  useEffect(() => {
    const token = localStorage.getItem("auth");
    if (token) {
      setIsReady(true);
    } else {
      console.log("Token not found");
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const fetchAuthor = async () => {
      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          console.log("Token not found");
          return;
        }
        const response = await userFetcher.getUserById(post.author, JSON.parse(token).token);
        setPostAuthor(response as unknown as AccountInfo);
      } catch (error) {
        console.error("Failed to fetch post author:", error);
      }
    };

    fetchAuthor();
  }, [isReady, post.author]); 


  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-300">
        <div className="avatar">
          <Link to={`/profile/${postAuthor?.username}`} className="w-8 rounded-full overflow-hidden">
            <img src={postAuthor?.avatar || "/boy1.png"} alt="Profile" />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postAuthor?.username}`} className="font-bold">
              {postAuthor?.name}
            </Link>
            <span className="text-gray-300 flex gap-1 text-sm">
              <Link to={`/profile/${postAuthor?.username}`}>@{postAuthor?.username}</Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.title}</span>
            <div className="carousel rounded-box">
              {post.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="carousel-item h-80 object-contain rounded-lg border border-gray-300"
                  alt={`Post Image ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div className="flex gap-1 items-center cursor-pointer group">
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">0</span>
              </div>

              <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    <p className="text-sm text-slate-500">No comments yet 🤔 Be the first one 😉</p>
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? (
                        <span className="loading loading-spinner loading-md"></span>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
              </div>
              <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
                {!isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />}
                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : ""
                  }`}
                >
                  0
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
