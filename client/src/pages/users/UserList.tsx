import React, { useEffect, useRef } from "react";
import { useUserContext } from "../../context/UserContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useSearchContext } from "../../context/SearchContext";
import { useFollowContext } from "../../context/FollowContext";
import { Link } from "react-router-dom";

const UsersList = () => {
  const { allUsers, loading, loadMoreUsers, hasMore, fetchUsers } =
    useUserContext();
  const { auth } = useAuthContext();
  const { followUser } = useFollowContext();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMoreUsers();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.disconnect();
    };
  }, [loadMoreUsers, loading, hasMore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollowOrUnfollow = async (
    userId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    followUser(userId);
  };

  return (
    <div className="space-y-4">
      {!loading &&
        allUsers.map((user) =>
          user._id ? (
            <div key={user._id} className="card bg-base-100 shadow-xl">
              <div className="card-body p-4">
                <div className="flex items-start space-x-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img src={user.avatar} alt={`${user.name}'s avatar`} />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/users/profile/${user._id}`}
                          state={{ userId: user._id }}
                          className="font-bold"
                        >
                          {user.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(event) =>
                          handleFollowOrUnfollow(user._id, event)
                        }
                      >
                        {user.followed ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )}

      {allUsers.length === 0 && !loading && <p>No users found.</p>}
      <div ref={observerRef} style={{ height: 20 }}></div>
    </div>
  );
};

export default UsersList;
