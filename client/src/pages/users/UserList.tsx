import { useUserContext } from '../../context/UserContext';
const UsersList = () => {
  const { allUsers, loading, error } = useUserContext();

  if (loading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {allUsers.map((user) => (
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
                    <h2 className="card-title text-sm font-bold">{user.name}</h2>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  <button className="btn btn-primary btn-sm">Follow</button>
                </div>
                {/* <p className="text-sm mt-2">{user.}</p>
                <div className="card-actions justify-start mt-2">
                  <a href={`https://${user.link}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center">
                    <FiExternalLink className="mr-1" />
                    {user.link}
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
