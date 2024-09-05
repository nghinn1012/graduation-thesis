// PostModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoCloseSharp as IoCloseSharpIcon } from "react-icons/io5";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, about: string, images: string[]) => void;
}

const CreatePostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const imgRef = useRef<HTMLInputElement | null>(null);

  const [ingredients, setIngredients] = useState<
    { name: string; amount: string }[]
  >([]);
  // State to manage the list of input fields
  const [inputFields, setInputFields] = useState<
    { name: string; amount: string }[]
  >([{ name: "", amount: "" }]);

  // Handle adding a new row of input fields
  const handleAddInputField = () => {
    setInputFields([...inputFields, { name: "", amount: "" }]);
  };

  // Handle updating the input field values
  const handleInputChange = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    const updatedFields = inputFields.map((inputField, i) =>
      i === index ? { ...inputField, [field]: value } : inputField
    );
    setInputFields(updatedFields);
  };

  // Handle saving the ingredients
  const handleSaveIngredients = () => {
    setIngredients(inputFields.filter((field) => field.name && field.amount)); // Filter out empty fields
    setInputFields([{ name: "", amount: "" }]); // Reset input fields
  };

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === files.length) {
          setImages((prevImages) => [...prevImages, ...imageUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);

      if (newImages.length === 0 && imgRef.current) {
        imgRef.current.value = "";
      }

      return newImages;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(title, about, images);
    setTitle("");
    setAbout("");
    setImages([]);
    if (imgRef.current) {
      imgRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (imgRef.current) {
      imgRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inset-0 flex items-start justify-center z-50">
      <div
        className="modal-overlay fixed inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="modal-content absolute top-0 bg-white p-6 rounded-lg max-w-3xl w-full z-60">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <IoCloseSharpIcon className="w-6 h-6" />
        </button>
        <div className="tabs tabs-boxed mt-4" role="tablist">
          <a
            role="tab"
            className={`tab tab-lifted  ${activeTab === 0 ? "tab-active" : ""}`}
            onClick={() => setActiveTab(0)}
          >
            The basics
          </a>
          <a
            role="tab"
            className={`tab tab-lifted ${activeTab === 1 ? "tab-active" : ""}`}
            onClick={() => setActiveTab(1)}
          >
            Recipe
          </a>
        </div>
        <form
          className="flex flex-col gap-4 w-full mt-4"
          onSubmit={handleSubmit}
        >
          {activeTab === 0 && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                NEW POST.
              </h1>
              <p className="text-gray-900 dark:text-white">
                Let's get started by adding some basic information about your
                post.
              </p>
              <div className="mt-4">
                <div className="flex flex-row gap-4 justify-center align-center">
                  <button
                    type="button"
                    className="w-[30%] py-3 bg-red-500 text-white font-semibold rounded-lg mb-6"
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
                  <div
                    className={`carousel rounded-box w-[273px] ${
                      images.length > 0 ? "h-[273px]" : ""
                    }`}
                  >
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
          )}
          {activeTab === 1 && (
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col w-full max-w-lg">
                {/* Recipe Details Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">RECIPE DETAILS.</h2>
                </div>

                {/* Time and Servings */}
                <div className="flex justify-between mb-4 mx-auto w-full">
                  <div className="flex-1 ml-20">
                    <label className="block text-sm font-semibold mb-1">
                      TIME.
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md mx-auto"
                      placeholder="0 mins"
                    />
                  </div>
                  <div className="flex-1 ml-20">
                    <label className="block text-sm font-semibold mb-1">
                      SERVINGS.
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="0 servings"
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">INGREDIENTS</h3>
                    <button className="text-red-500">Edit</button>
                  </div>

                  {/* Render input fields */}
                  {inputFields.map((inputField, index) => (
                    <div key={index} className="flex mt-2 space-x-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Add new ingredient"
                        value={inputField.name}
                        onChange={(e) =>
                          handleInputChange(index, "name", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="w-20 p-2 border rounded-md"
                        placeholder="Amount"
                        value={inputField.amount}
                        onChange={(e) =>
                          handleInputChange(index, "amount", e.target.value)
                        }
                      />
                    </div>
                  ))}

                  <div className="flex mt-2 space-x-2">
                    <button
                      type="button"
                      className="text-gray-500"
                      onClick={handleAddInputField}
                    >
                      + Add More
                    </button>
                    <button
                      type="button"
                      className="text-gray-500"
                      onClick={handleSaveIngredients}
                    >
                      Save Ingredients
                    </button>
                  </div>

                  <div className="mt-4">
                    {ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1"
                      >
                        <span>{ingredient.name}</span>
                        <span>{ingredient.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">INSTRUCTIONS.</h3>
                  <div className="flex items-start mb-2">
                    <span className="text-sm font-medium mr-2">Step 1</span>
                    <div className="flex-1">
                      {/* Example image */}
                      <div className="relative mb-2">
                        <img
                          src="example-image-url"
                          alt="Step 1"
                          className="w-full rounded-lg object-cover"
                        />
                        <button className="absolute top-2 right-2 text-white bg-black p-1 rounded-full">
                          <IoCloseSharpIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Describe the step..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex ml-[90%] justify-between py-2 border-t-gray-300">
            <button
              className="btn  bg-red-500 rounded-full btn-sm text-white px-4"
              type="submit"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
