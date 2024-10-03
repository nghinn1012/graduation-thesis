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

interface User {
  _id: string;
  fullName: string;
  username: string;
  profileImg: string;
  coverImg: string;
  bio: string;
  link: string;
  following: string[];
  followers: string[];
}

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
    setIsLoading,
    setPosts,
    setPage,
    setHasMore,
  } = useProfileContext();

  const { followUser } = useFollowContext();
  const { auth, account } = useAuthContext();
  const [user, setUser] = useState<AccountInfo | null>(null);
  const { id } = useParams();
  const isMyProfile = account?._id === id;
  const observer = useRef<IntersectionObserver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
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
    const fetchUser = async () => {
      try {
        if (!id || !auth?.token) return;
        if (id !== userId) {
          console.log(`Fetching user: oldId = ${userId}, newId = ${id}`);
          setUserId(id);
        }
        const response = await userFetcher.getUserById(id, auth?.token);
        setUser(response as unknown as AccountInfo);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [id, auth?.token, userId]);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setUserId(id);
          setIsLoading(true);
          await fetchPosts(id);
          await Promise.all([fetchLikedPosts(), fetchSavedPosts()]);
        } catch (error) {
          console.error("Error loading posts:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [fetchLikedPosts, fetchSavedPosts, id]);

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
    if (!observer.current) {
      observer.current = new IntersectionObserver(
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

    const loader = document.getElementById("loader");
    if (loader) {
      observer.current.observe(loader);
    }

    return () => {
      if (loader) {
        observer.current?.unobserve(loader);
      }
    };
  }, [hasMore, loadMorePosts]);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  }, []);

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleBack = () => {
    navigate(-1);
    setUserId(undefined);
    setUser(null);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  };

  const handleSubmit = async (
    avatarImageFile: string | null,
    coverImageFile: string | null,
    name: string,
    bio: string
  ) => {
    console.log(name, bio, avatarImageFile, coverImageFile);
    if (!auth?.token || !user) return;
    try {
      const response = await userFetcher.updateUser(
        user._id,
        {
          avatar: avatarImageFile || "",
          coverImage: coverImageFile || "",
          name,
          bio,
        } as unknown as UpdateDataInfo,
        auth?.token
      );
      console.log("Updated user:", response);
      setUser(response.user as unknown as AccountInfo);
      setPosts((prev) =>
        prev.map((post) => ({ ...post, author: response.user }))
      );
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
      <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
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
                    {posts?.length} posts
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
              <div className="flex w-full border-b border-gray-700 mt-4">
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
            {isLoading && posts.length > 0 && (
              <div className="flex justify-center my-4">
                <PostSkeleton />
              </div>
            )}
            <div id="loader" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
