import React, { useState, useMemo } from 'react';
import { useAdminUserContext } from "../../context/AdminUserContext";
import { formatDistance } from "date-fns";
import { FaBan, FaCheckCircle } from 'react-icons/fa';
import { useI18nContext } from '../../hooks/useI18nContext';

const UserManagementPage = () => {
  const { users, loading, updateUserStatus } = useAdminUserContext();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const language = useI18nContext();
  const lang = language.of("ProfilePage", "AdminSection");

  const filteredUsers = useMemo(() => {
    switch (selectedStatus) {
      case "active":
        return users.filter(user => !(user.verify == 2));
      case "banned":
        return users.filter(user => user.verify == 2);
      default:
        return users;
    }
  }, [users, selectedStatus]);

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="card bg-base-100 shadow-xl">
        {/* Status Filter */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`btn btn-sm ${selectedStatus === "all" ? "btn-primary" : "btn-ghost"}`}
            >
              {lang("all-users")}
              <div className="badge badge-sm ml-2">{users.length}</div>
            </button>
            <button
              onClick={() => setSelectedStatus("active")}
              className={`btn btn-sm ${selectedStatus === "active" ? "btn-primary" : "btn-ghost"}`}
            >
              {lang("active-users")}
              <div className="badge badge-sm ml-2">{users.filter(u => !(u.verify == 2)).length}</div>
            </button>
            <button
              onClick={() => setSelectedStatus("banned")}
              className={`btn btn-sm ${selectedStatus === "banned" ? "btn-primary" : "btn-ghost"}`}
            >
              {lang("banned-users")}
              <div className="badge badge-sm ml-2">{users.filter(u => (u.verify == 2)).length}</div>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{lang("user-info")}</th>
                <th>{lang("username")}</th>
                <th>{lang("email")}</th>
                <th>{lang("join-date")}</th>
                <th>{lang("status")}</th>
                <th>{lang("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="bg-primary text-primary-content grid place-items-center">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-xs opacity-50">{user.role}</div>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs opacity-60">
                      {formatDistance(new Date(user.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </td>
                  <td>
                    <div className={`badge ${user.verify == 2 ? 'badge-error' : 'badge-success'}`}>
                      {user.verify == 2 ? lang("banned") : lang("active")}
                    </div>
                  </td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${user.verify == 2 ? 'btn-success' : 'btn-error'}`}
                        onClick={() => updateUserStatus(user._id, !(user.verify == 2))}
                      >
                        {user.verify == 2 ? (
                          <>
                            <FaCheckCircle className="w-4 h-4" />
                            <span>{lang(
                              "unban"
                            )}</span>
                          </>
                        ) : (
                          <>
                            <FaBan className="w-4 h-4" />
                            <span>{lang("ban")}</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            No users found for the selected filter
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
