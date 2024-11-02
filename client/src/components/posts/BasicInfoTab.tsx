import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import * as Yup from "yup";
import { PostInfo } from "../../api/post";

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
  hasProduct: boolean;
  setHasProduct: React.Dispatch<React.SetStateAction<boolean>>;
  price: number | string;
  setPrice: React.Dispatch<React.SetStateAction<number | string>>;
  quantity: number | string;
  setQuantity: React.Dispatch<React.SetStateAction<number | string>>;
  timeToPrepare: number | string;
  setTimeToPrepare: React.Dispatch<React.SetStateAction<number | string>>;
  isSubmitting: boolean;
  currentIndex: number;
  goToPrevious: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  goToNext: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  post: PostInfo;
  setIsBasicTabValid: React.Dispatch<React.SetStateAction<boolean>>;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  about: Yup.string().required("About is required"),
  images: Yup.array().min(1, "At least one image is required"),

  price: Yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Price is required")
        .test("is-positive", "Price must be a positive number", (value) =>
          value ? parseFloat(value) > 0 : false
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  quantity: Yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Quantity is required")
        .test("is-positive", "Quantity must be at least 1", (value) =>
          value ? parseInt(value, 10) >= 1 : false
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  timeToPrepare: Yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Time to prepare is required")
        .test(
          "is-positive",
          "Time to prepare must be at least 1 minute",
          (value) => (value ? parseInt(value, 10) >= 1 : false)
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

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
  hasProduct,
  setHasProduct,
  price,
  setPrice,
  quantity,
  setQuantity,
  timeToPrepare,
  setTimeToPrepare,
  isSubmitting,
  currentIndex,
  goToPrevious,
  goToNext,
  post,
  setIsBasicTabValid,
}) => {
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  useEffect(() => {
    const validate = async () => {
      try {
        await validationSchema.validate(
          { title, about, images, price, quantity, timeToPrepare, hasProduct },
          { abortEarly: false }
        );
        setErrors({});
        setIsBasicTabValid(true);
      } catch (err) {
        const validationErrors: { [key: string]: string } = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            if (error.path) {
              validationErrors[error.path] = error.message;
            }
          });
          setErrors(validationErrors);
          console.log(validationErrors);
        }
      }
    };

    validate();
  }, [
    title,
    about,
    images,
    price,
    quantity,
    timeToPrepare,
    setIsBasicTabValid,
    hasProduct,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        {post ? "EDIT POST" : "NEW POST"}.
      </h1>
      {!post && (
        <p className="text-gray-900 dark:text-white">
          Let's get started by adding some basic information about your post.
        </p>
      )}
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
                className={`carousel-item ${
                  index === currentIndex ? "block" : "hidden"
                }`}
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
        {errors.title && <p className="text-red-500">{errors.title}</p>}
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
        {errors.about && <p className="text-red-500">{errors.about}</p>}
      </div>
      <div className="mt-4">
        <div className="flex items-center space-x-6 py-2">
          <span className="font-semibold">Is this recipe sold by you?</span>
          <input
            type="checkbox"
            className="toggle toggle-accent"
            checked={hasProduct}
            onChange={() => setHasProduct(!hasProduct)}
          />
        </div>

        {hasProduct && (
          <div className="mt-4 space-y-4">
            <div>
              <h2 className="font-bold text-lg">PRODUCT DETAILS.</h2>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={Number(price)}
                onChange={(e) => {
                  const value = e.target.value.replace(/^0+/, "");
                  setPrice(Number(value));
                }}
              />
              {errors.price && <p className="text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              {errors.quantity && (
                <p className="text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time to Prepare (mins)
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={timeToPrepare}
                onChange={(e) => setTimeToPrepare(Number(e.target.value))}
              />
              {errors.timeToPrepare && (
                <p className="text-red-500">{errors.timeToPrepare}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoTab;
