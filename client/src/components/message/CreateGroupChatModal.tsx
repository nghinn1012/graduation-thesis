import React, { useState } from 'react';
import { AccountInfo } from '../../api/user';
import { useUserContext } from '../../context/UserContext';
import { createChatGroup } from '../../api/notification';
import { useAuthContext } from '../../hooks/useAuthContext';

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (data: createChatGroup) => void;
}

const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<AccountInfo[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const {allUsers} = useUserContext();
  const {account} = useAuthContext();
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.find(selected => selected._id === user._id)
  );

  const handleUserSelect = (user: AccountInfo): void => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const handleUserRemove = (userId: string): void => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const handleCreateGroup = (): void => {
    if (selectedUsers.length > 0 && groupName.trim()) {
      onCreateGroup({
        groupName: groupName,
        members: [...selectedUsers.map(user => user._id), account?._id ?? ''],
        createdBy: account?._id || selectedUsers[0]._id,
        isPrivate: false
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-xl">
        <h3 className="font-bold text-lg">Create New Group Chat</h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Group Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter group name"
            className="input input-bordered w-full"
            value={groupName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <label className="label">
              <span className="label-text">Selected Users</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div key={user._id} className="badge badge-outline gap-2">
                  {user.name}
                  <button
                    onClick={() => handleUserRemove(user._id)}
                    className="btn btn-xs btn-ghost btn-circle"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text">Search Users</span>
          </label>
          <input
            type="text"
            placeholder="Type to search..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 h-48 overflow-y-auto border rounded-box">
          {filteredUsers.map(user => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className="btn btn-ghost w-full justify-start normal-case h-auto py-2"
            >
              <div className="avatar placeholder mr-2">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                  <span className="text-xs">{user.name[0].toUpperCase()}</span>
                </div>
              </div>
              <span>{user.name}</span>
            </button>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleCreateGroup}
            disabled={selectedUsers.length === 0 || !groupName.trim()}
          >
            Create Group
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default CreateGroupChatModal;
