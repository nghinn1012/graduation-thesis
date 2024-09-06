import React from 'react';
import { IoCloseSharp } from 'react-icons/io5';

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
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  title,
  about,
  images,
  imgRef,
  handleClick,
  handleImgChange,
  removeImage,
  setTitle,
  setAbout,
}) => (
  <div>
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">NEW POST.</h1>
    <p className="text-gray-900 dark:text-white">
      Let's get started by adding some basic information about your post.
    </p>
    <div className="mt-4">
      <div className="flex flex-col gap-4 justify-center items-center">
        <button
          type="button"
          className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg mb-6"
          onClick={handleClick}
        >
          Add Photos
        </button>
        <input
          type="file"
          className="hidden"
          onChange={handleImgChange}
          multiple
          ref={imgRef}
        />
      </div>
      <div className="flex justify-center items-center mt-4">
        <div className={`carousel rounded-box ${images.length > 0 ? "h-[273px]" : ""} w-[273px]`}>
          {images.map((img, index) => (
            <div key={index} className="carousel-item relative">
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
      />
    </div>
    <div className="mt-4">
      <label className="block mb-2 text-sm">About</label>
      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Tell us about your post"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />
    </div>
  </div>
);

export default BasicInfoTab;
