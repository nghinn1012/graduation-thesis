import React, { useState, useRef, ChangeEvent } from "react";
import { MdEdit } from "react-icons/md";
import { AccountInfo } from "../../api/user";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatar: File | null, cover: File | null) => void;
  user: AccountInfo;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [avatarImagePreview, setAvatarImagePreview] = useState<string | null>(
    null
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null);
  const [name, setName] = useState<string>(user.name);
  const [bio, setBio] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const coverImgRef = useRef<HTMLInputElement | null>(null);
  const profileImgRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      if (type === "coverImg") {
        setCoverImagePreview(previewUrl);
        setCoverImageFile(file);
      } else if (type === "profileImg") {
        setAvatarImagePreview(previewUrl);
        setAvatarImageFile(file);
      }
    }
  };

  const handleSave = () => {
    onSave(avatarImageFile, coverImageFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="font-bold text-xl mb-4">Edit Profile</h3>

        <div className="relative group/cover">
          {/* Cover Image */}
          <img
            src={coverImagePreview || "/cover.png"}
            className="h-52 w-full object-cover"
            alt="cover image"
          />

          <div
            className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
            onClick={() => coverImgRef.current?.click()}
          >
            <MdEdit className="w-5 h-5 text-white" />
          </div>

          <input
            type="file"
            name="coverImage"
            hidden
            ref={coverImgRef}
            onChange={(e) => handleImageChange(e, "coverImg")}
          />

          {/* User Avatar */}
          <div className="avatar absolute -bottom-16 left-4">
            <div className="w-32 rounded-full relative group/avatar">
              <img
                src={avatarImagePreview || "/avatar-placeholder.png"}
                className="rounded-full"
                alt="avatar"
              />
              <div className="absolute top-5 right-3 p-1 bg-primary rounded-full opacity-0 group-hover/avatar:opacity-100 transition duration-200 cursor-pointer">
                <MdEdit
                  className="w-4 h-4 text-white"
                  onClick={() => profileImgRef.current?.click()}
                />
              </div>
            </div>
          </div>
          <input
            type="file"
            name="avatarImage"
            hidden
            ref={profileImgRef}
            onChange={(e) => handleImageChange(e, "profileImg")}
          />
        </div>

        {/* Name, Bio, and Location Fields */}
        <div className="mt-16 mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
