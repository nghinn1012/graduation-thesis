import { useRef, useState, ChangeEvent, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { usePostContext } from "../../context/PostContext";
import { useUserContext } from "../../context/UserContext";
import ProfileHeaderSkeleton from "../../components/skeleton/ProfileHeaderSkeleton";
import { AccountInfo, UpdateDataInfo, userFetcher } from "../../api/user";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProfileContext } from "../../context/ProfileContext";
import Post from "../../components/posts/PostInfo";
import PostSkeleton from "../../components/skeleton/PostSkeleton";
import EditProfileModal from "../../components/profile/EditProfileModal";
import { useFollowContext } from "../../context/FollowContext";
import { useSocket } from "../../hooks/useSocketContext";
import { PostInfo } from "../../api/post";

const ProfilePage: React.FC = () => {
  const [coverImg, setCoverImg] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<string>("posts");

  const coverImgRef = useRef<HTMLInputElement | null>(null);
  const profileImgRef = useRef<HTMLInputElement | null>(null);
  const {
    hasMore,
    loadMorePosts,
    posts,
    setUserId,
    userId,
    isLoading,
    fetchPosts,
    fetchLikedPosts,
    fetchSavedPosts,
    setPosts,
    setPage,
    setHasMore,
    user,
    setUser,
    postLikes,
    fetchSavedPostInProfile,
    fetchPostsLikeInProfile,
    pageLike,
    setPageLike,
    setPostLikes,
    hasMoreLike,
    isLoadingLike,
    loadMorePostsLike,
    setIsLoading,
  } = useProfileContext();

  const { followUser } = useFollowContext();
  const { auth, account, setAccount} = useAuthContext();
  const { posts: postsHome, setPosts: setPostsHome } = usePostContext();
  const { id } = useParams();
  const isMyProfile = account?._id === id;
  const postsObserver = useRef<IntersectionObserver | null>(null);
  const likesObserver = useRef<IntersectionObserver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const handleFollow = async () => {
    if (!user || !auth?.token || !account?._id) return;
    followUser(user._id);
    setUser(
      (prev) =>
        ({
          ...prev,
          followers: prev?.followers?.includes(account?._id || "")
            ? prev?.followers?.filter((id) => id !== account?._id)
            : [...(prev?.followers || []), account?._id || ""],
          followed: !prev?.followed,
        } as AccountInfo)
    );
  };

  useEffect(() => {
    const handleFetchUser = async () => {
      if (id && auth?.token && setPostsHome) {
        try {
          const response = await userFetcher.getUserById(id, auth?.token);
          const updatedUser = response as unknown as AccountInfo;
          setUser({
            ...updatedUser,
            followed: user?.followers?.includes(account?._id || "") || false,
            postCount: user?.postCount,
          });

          setPosts((prev) =>
            prev.map((post) =>
              post.author._id === id
                ? { ...post, author: updatedUser } as unknown as PostInfo
                : post
            )
          );

          setPostsHome((prev) =>
            prev.map((post) =>
              post.author._id === id
                ? { ...post, author: updatedUser } as unknown as PostInfo
                : post
            )
          );
          setPostLikes((prev) =>
            prev.map((post) =>
              post.author._id === id
                ? { ...post, author: updatedUser } as unknown as PostInfo
                : post
            )
          );
          setAccount((prev) =>
            prev?._id === id
              ? { ...prev, ...updatedUser }
              : prev
          );

        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    if (socket) {
      const handleProfileUpdate = async () => {
        setIsLoading(true);
        await handleFetchUser();
        setIsLoading(false);
      };

      socket.on("user_profile_updated", handleProfileUpdate);
    }

    return () => {
      if (socket) {
        socket.off("user_profile_updated", handleFetchUser);
      }
    };
  }, [auth?.token, socket, setPosts, setPostsHome]);


  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setUserId(id);
          fetchPosts(id);
          await Promise.all([fetchLikedPosts(), fetchSavedPosts()]);
        } catch (error) {
          console.error("Error loading posts:", error);
        }
      }
    };
    loadData();
  }, [fetchLikedPosts, fetchSavedPosts, id]);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setUserId(id);
          fetchPostsLikeInProfile(id);
          fetchSavedPostInProfile();
        } catch (error) {
          console.error("Error loading posts:", error);
        }
      }
    };
    loadData();
  }, [fetchSavedPostInProfile, id]);

  const handleImgChange = (
    e: ChangeEvent<HTMLInputElement>,
    state: "coverImg" | "profileImg"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (state === "coverImg") setCoverImg(reader.result as string);
        if (state === "profileImg") setProfileImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!postsObserver.current) {
      postsObserver.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            loadMorePosts();
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
    }

    const postsLoader = document.getElementById("postsLoader");
    if (postsLoader) {
      postsObserver.current.observe(postsLoader);
    }

    return () => {
      if (postsLoader && postsObserver.current) {
        postsObserver.current.unobserve(postsLoader);
      }
    };
  }, [hasMore, loadMorePosts]);

  useEffect(() => {
    if (!likesObserver.current) {
      likesObserver.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMoreLike) {
            loadMorePostsLike();
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
    }

    const likesLoader = document.getElementById("likesLoader");
    if (likesLoader) {
      likesObserver.current.observe(likesLoader);
    }

    return () => {
      if (likesLoader && likesObserver.current) {
        likesObserver.current.unobserve(likesLoader);
      }
    };
  }, [hasMoreLike, loadMorePostsLike]);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (node && postsObserver.current) {
      postsObserver.current.observe(node);
    }
  }, []);

  const lastLikeRef = useCallback((node: HTMLDivElement | null) => {
    if (node && likesObserver.current) {
      likesObserver.current.observe(node);
    }
  }, []);

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleBack = () => {
    navigate(-1);
    setUserId(undefined);
    setUser(undefined);
    setPosts([]);
    setPostLikes([]);
    setPage(1);
    setPageLike(1);
    setHasMore(true);
  };

  const handleSubmit = async (
    avatarImageFile: string | null,
    coverImageFile: string | null,
    name: string,
    bio: string
  ) => {
    console.log(name, bio, avatarImageFile, coverImageFile);
    setIsLoading(true);
    if (!auth?.token || !user || !setPostsHome) return;

    const change = {
      avatar: avatarImageFile !== user.avatar ? avatarImageFile : undefined,
      coverImage:
        coverImageFile !== user.coverImage ? coverImageFile : undefined,
      name: name !== user.name ? name : undefined,
      bio: bio !== user.bio ? bio : undefined,
    };

    try {
      const response = await userFetcher.updateUser(
        user._id,
        change as unknown as UpdateDataInfo,
        auth?.token
      );

      if (!change.avatar && !change.coverImage) {
        console.log("No image change");
        setUser(response.user as unknown as AccountInfo);
        setPosts((prev) =>
          prev.map((post) => ({ ...post, author: response.user }))
        );
        setPostsHome((prev) =>
          prev.map((post) =>
            post.author._id === user._id
              ? { ...post, author: response.user }
              : post
          )
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    console.log("isLoading state updated:", isLoading);
  }, [isLoading]);

  return (
    <>
      <div className="flex-[4_4_0]  border-r border-gray-300 min-h-screen ">
        {/* HEADER */}
        {isLoading && <ProfileHeaderSkeleton />}
        <div className="flex flex-col">
          {user && !isLoading && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <div className="font-bold" onClick={handleBack}>
                  <FaArrowLeft className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.name}</p>
                  <span className="text-sm text-slate-500">
                    {user.postCount} posts
                  </span>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImage || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />

                <input
                  type="file"
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={
                        profileImg || user?.avatar || "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-4 mt-5">
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={handleFollow}
                  >
                    {user.followed ? "Unfollow" : "Follow"}
                  </button>
                )}
                {isMyProfile && (
                  <button
                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                    onClick={handleOpenEditModal}
                  >
                    Edit Profile
                  </button>
                )}
                {isModalOpen && (
                  <EditProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSubmit}
                    user={user}
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.name}</span>
                  <span className="text-sm text-slate-500">
                    @{user?.username}
                  </span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-sm">
                      {user?.following?.length}
                    </span>
                    <span className="text-slate-500 text-sm">Following</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-sm">
                      {user?.followers?.length}
                    </span>
                    <span className="text-slate-500 text-sm">Followers</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full border-b border-gray-300 mt-4">
                <div
                  className="flex justify-center flex-1 p-3 hover:bg-red-500 transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <div
                  className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-red-500 transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Integrated Profile Posts */}
          {feedType === "posts" && (
            <div className="mt-5 px-4">
              {posts.length > 0 && !isLoading && (
                <div>
                  {posts.map((post, index) => (
                    <div
                      key={post._id}
                      ref={index === posts.length - 1 ? lastPostRef : null}
                    >
                      <Post post={post} />
                    </div>
                  ))}
                </div>
              )}
              {isLoading && hasMoreLike && (
                <div className="flex justify-center my-4">
                  <PostSkeleton />
                </div>
              )}
              <div id="postsLoader" />
            </div>
          )}
          {feedType === "likes" && (
            <div className="mt-5 px-4">
              {postLikes.length > 0 && (
                <div>
                  {postLikes.map((post, index) => (
                    <div
                      key={post._id}
                      ref={index === postLikes.length - 1 ? lastLikeRef : null}
                    >
                      <Post post={post} />
                    </div>
                  ))}
                </div>
              )}
              {isLoadingLike && hasMoreLike && (
                <div className="flex justify-center my-4">
                  <PostSkeleton />
                </div>
              )}
              <div id="likesLoader" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
