import React from "react";
import { IoCloseSharp } from "react-icons/io5";
interface BasicInfoTabProps {
  title: string;
  about: string;
  images: string[];
  imgRef: React.RefObject<HTMLInputElement>;
  handleClick: () => void;
  handleImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setAbout: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  hashtags: string[];
  newHashtag: string;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  setNewHashtag: React.Dispatch<React.SetStateAction<string>>;
  addHashtag: () => void;
  removeHashtag: (index: number) => void;
  currentIndex: number;
  goToPrevious: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  goToNext: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  title,
  about,
  images,
  imgRef,
  hashtags,
  newHashtag,
  handleClick,
  handleImgChange,
  removeImage,
  setTitle,
  setAbout,
  setHashtags,
  setNewHashtag,
  isSubmitting,
  addHashtag,
  removeHashtag,
  currentIndex,
  goToPrevious,
  goToNext,
}) => (
  <div>
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
      NEW POST.
    </h1>
    <p className="text-gray-900 dark:text-white">
      Let's get started by adding some basic information about your post.
    </p>
    <div className="mt-4">
      <div className="flex flex-col gap-4 justify-center items-center">
        <button
          type="button"
          className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg mb-6"
          onClick={handleClick}
          disabled={isSubmitting}
        >
          Add Photos
        </button>
        <input
          type="file"
          className="hidden"
          onChange={handleImgChange}
          multiple
          ref={imgRef}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-center relative items-center mt-4">
        <div
          className={`carousel relative rounded-box ${
            images.length > 0 ? "h-[273px]" : ""
          } w-[273px]`}
        >
          {images.map((img, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? "block" : "hidden"}`}
          >
            <IoCloseSharp
              className="absolute top-2 right-3 z-50 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => removeImage(index)}
            />
            <img
              src={img}
              alt={`Selected ${index}`}
              className="object-cover"
              style={{ width: "273px", height: "273px" }}
            />
          </div>
        ))}

        {images.length > 1 && (
          <>
            <button
              className="btn-sm absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full flex justify-center items-center"
              onClick={(e) => goToPrevious(e)}
            >
              ❮
            </button>
            <button
              className="btn-sm absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full flex justify-center items-center"
              onClick={(e) => goToNext(e)}
            >
              ❯
            </button>
          </>
        )}
        </div>
      </div>
    </div>
    <div className="mt-4">
      <label className="block mb-2 text-sm">Title</label>
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Enter post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />
    </div>
    <div className="mt-4">
      <label className="block mb-2 text-sm">About</label>
      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Tell us about your post"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        disabled={isSubmitting}
      />
    </div>
    <div className="mt-4">
      <label className="block mb-2 text-sm">Hashtags</label>
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Enter a hashtag"
          value={newHashtag}
          onChange={(e) => setNewHashtag(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="button"
          className="btn btn-neutral"
          onClick={addHashtag}
          disabled={isSubmitting}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, index) => (
          <div
            key={index}
            className="badge badge-lg badge-default badge-outline py-4 px-2 font-bold"
          >
            {hashtag}
            <IoCloseSharp
              className="ml-1 cursor-pointer"
              onClick={() => removeHashtag(index)}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BasicInfoTab;
