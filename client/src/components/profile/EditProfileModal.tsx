import React, { useState, useRef, ChangeEvent } from "react";
import { MdEdit } from "react-icons/md";
import { AccountInfo } from "../../api/user";
import imageCompression from "browser-image-compression";
import { useI18nContext } from "../../hooks/useI18nContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    avatar: string | null,
    cover: string | null,
    name: string,
    bio: string
  ) => void;
  user: AccountInfo;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(user.coverImage || null);
  const [avatarImagePreview, setAvatarImagePreview] = useState<string | null>(user.avatar || null);
  const [coverImageFile, setCoverImageFile] = useState<string | null>(user.coverImage || "");
  const [avatarImageFile, setAvatarImageFile] = useState<string | null>(user.avatar || "");
  const [name, setName] = useState<string>(user.name || "");
  const [bio, setBio] = useState<string>(user.bio ||"");

  const coverImgRef = useRef<HTMLInputElement | null>(null);
  const profileImgRef = useRef<HTMLInputElement | null>(null);
  const languageContext = useI18nContext();
  const lang = languageContext.of("ProfilePage");

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = e.target.files;
    const compressOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
    };

    if (files && files.length > 0) {
      let imageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const compressedFile = await imageCompression(file, compressOptions);

          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            imageUrls.push(result);

            if (type === "coverImg") {
              setCoverImagePreview(result);
              setCoverImageFile(result);
            } else if (type === "profileImg") {
              setAvatarImagePreview(result);
              setAvatarImageFile(result);
            }
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error("Image compression error: ", error);
        }
      }
    }
  };

  const handleSave = () => {
    onSave(avatarImageFile, coverImageFile, name, bio);
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

        <h3 className="font-bold text-xl mb-4">{lang("edit-profile")}</h3>

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
          <label className="block text-gray-700">{lang("name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">{lang("bio")}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={handleSave}>
            {lang("save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
