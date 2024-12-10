import React, { useState, useEffect } from 'react';
import { AccountInfo } from '../../api/user';
import { useUserContext } from '../../context/UserContext';
import { createChatGroup } from '../../api/notification';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useMessageContext } from '../../context/MessageContext';
import { useToastContext } from '../../hooks/useToastContext';
import { useI18nContext } from '../../hooks/useI18nContext';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (data: createChatGroup) => void;
  initialChatType: 'private' | 'group';
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
  initialChatType
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<AccountInfo[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [isGroupChat, setIsGroupChat] = useState<boolean>(initialChatType === 'group');
  const { account } = useAuthContext();
  const { chatGroups, setChatGroupSelect, allUsers } = useMessageContext();
  const { error } = useToastContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of('MessageSection');

  const resetForm = (): void => {
    setSelectedUsers([]);
    setGroupName('');
    setSearchTerm('');
  };

  useEffect(() => {
    if (isOpen) {
      setIsGroupChat(initialChatType === 'group');
      resetForm();
    }
  }, [isOpen, initialChatType]);

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.find(selected => selected._id === user._id) &&
    user._id !== account?._id
  );

  const handleUserSelect = (user: AccountInfo): void => {
    if (!isGroupChat) {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId: string): void => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const findExistingGroup = (members: string[]): typeof chatGroups[0] | undefined => {
    const sortedNewMembers = [...members].sort();

    return chatGroups.find(group => {
      if (group.isPrivate !== !isGroupChat) return false;

      if (!isGroupChat) {
        return group.members.length === members.length &&
               group.members.every(m => members.includes(m));
      }

      const sortedGroupMembers = [...group.members].sort();
      return sortedGroupMembers.length === sortedNewMembers.length &&
             sortedGroupMembers.every((member, index) => member === sortedNewMembers[index]);
    });
  };

  const handleCreateChat = (): void => {
    if (selectedUsers.length === 0) return;

    const members = [...selectedUsers.map(user => user._id), account?._id ?? ''];
    const existingGroup = findExistingGroup(members);

    if (existingGroup) {
      setChatGroupSelect(existingGroup);
      error(lang('chatExists'));
      onClose();
      return;
    }

    const chatData: createChatGroup = {
      members,
      memberDetails: selectedUsers.map(user =>
        allUsers.find(u => u._id === user._id) || user
      ),
      createdBy: account?._id || '',
      isPrivate: !isGroupChat,
      groupName: isGroupChat ? groupName : selectedUsers[0].name
    };
    console.log(chatData);

    if (isGroupChat && !groupName.trim()) return;

    onCreateChat(chatData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-xl">
        <h3 className="font-bold text-lg">
          {lang(isGroupChat ? 'createGroupChat' : 'createPrivateChat')}
        </h3>

        {isGroupChat && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">{lang('groupName')}</span>
            </label>
            <input
              type="text"
              placeholder={lang('enterGroupName')}
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <label className="label">
              <span className="label-text">{lang('selectedUsers')}</span>
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
            <span className="label-text">{lang('searchUsers')}</span>
          </label>
          <input
            type="text"
            placeholder={lang('typeToSearch')}
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
              disabled={!isGroupChat && selectedUsers.length > 0}
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
          <button className="btn" onClick={onClose}>{lang('cancel')}</button>
          <button
            className="btn btn-primary"
            onClick={handleCreateChat}
            disabled={
              selectedUsers.length === 0 ||
              (isGroupChat && !groupName.trim())
            }
          >
            {lang(isGroupChat ? 'createGroup' : 'createChat')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default CreateChatModal;
