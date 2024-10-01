import React, { useState, useRef, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import BasicInfoTab from "./BasicInfoTab";
import RecipeDetailsTab from "./RecipeDetailsTab";
import imageCompression from "browser-image-compression";
import * as yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { useToastContext } from "../../hooks/useToastContext";
import HashtagTab from "./HashTagTab";

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
  about: yup.string().required("About is required"),
  timeToTake: yup.string().required("Time to take is required"),
  servings: yup
    .number()
    .required("Servings are required")
    .min(1, "Servings must be at least 1"),
  ingredients: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Ingredient name is required"),
        quantity: yup.string().required("Quantity is required"),
      })
    )
    .min(1, "At least one ingredient is required"),
  instructions: yup
    .array()
    .of(
      yup.object({
        description: yup
          .string()
          .required("Instruction description is required"),
        image: yup.string().nullable(),
      })
    )
    .min(1, "At least one instruction is required"),
});

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    about: string,
    images: string[],
    hashtags: string[],
    timeToTake: number,
    servings: number | string,
    ingredients: { name: string; quantity: string }[],
    instructions: {
      description: string;
      image?: string;
    }[],
    difficulty: string,
    course: string[],
    dietary: string[],
    isEditing: boolean,
    postId?: string
  ) => void;
  isSubmitting: boolean;
  post?: any;
  isEditing: boolean;
}

const CreatePostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  post,
  isEditing,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const imgRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToastContext();
  const [ingredients, setIngredients] = useState<
    { name: string; quantity: string }[]
  >([]);

  const [inputFields, setInputFields] = useState<
    { name: string; quantity: string }[]
  >([{ name: "", quantity: "" }]);

  const [instructions, setInstructions] = useState<
    { description: string; image?: string }[]
  >([{ description: "", image: "" }]);

  const [timeToTake, setTimeToTake] = useState<string | number>("");
  const [servings, setServings] = useState<number | string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [course, setCourse] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const fileInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isBasicTabValid, setIsBasicTabValid] = useState(false);
  const [isRecipeTabValid, setIsRecipeTabValid] = useState(false);
  useEffect(() => {
    fileInputRef.current = fileInputRef.current.slice(0, instructions.length);
  }, [instructions]);

  const handleInstructionChange = (
    index: number,
    field: "description" | "image",
    value: string
  ) => {
    const updatedInstructions = instructions.map((instruction, i) =>
      i === index ? { ...instruction, [field]: value } : instruction
    );
    setInstructions(updatedInstructions);
  };

  const handleImageChange = async (index: number, file: File | null) => {
    if (file) {
      try {
        const compressOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        };

        const compressedFile = await imageCompression(file, compressOptions);

        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedInstructions = instructions.map((instruction, i) =>
            i === index
              ? { ...instruction, image: reader.result as string }
              : instruction
          );
          setInstructions(updatedInstructions);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, { description: "", image: "" }]);
  };

  const handleAddInputField = () => {
    setInputFields([...inputFields, { name: "", quantity: "" }]);
  };

  const handleInputChange = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    const updatedFields = inputFields.map((inputField, i) =>
      i === index ? { ...inputField, [field]: value } : inputField
    );
    setInputFields(updatedFields);
    setIngredients(updatedFields);
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls: string[] = [];

    const compressOptions = {
      maxSizeMB: 1, // Tối đa kích thước file là 1MB
      maxWidthOrHeight: 1920, // Tối đa chiều dài hoặc chiều rộng
    };

    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, compressOptions);
        const reader = new FileReader();
        reader.onload = () => {
          imageUrls.push(reader.result as string);
          if (imageUrls.length === files.length) {
            setImages((prevImages) => [...prevImages, ...imageUrls]);
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);

      if (newImages.length === 0 && imgRef.current) {
        imgRef.current.value = "";
        setCurrentIndex(0);
      } else if (currentIndex >= newImages.length) {
        setCurrentIndex(newImages.length - 1);
      }

      return newImages;
    });
  };

  const removeImageInstruction = (index: number) => {
    const updatedInstructions = instructions.map((instruction, i) =>
      i === index ? { ...instruction, image: undefined } : instruction
    );
    setInstructions(updatedInstructions);
  };

  const handleRemoveInputField = (index: number) => {
    const newInputFields = [...inputFields];
    newInputFields.splice(index, 1);
    setInputFields(newInputFields);
  };

  const handleTimeToTake = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeToTake(e.target.value);
    console.log(timeToTake);
  };

  const handleServings = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServings(parseInt(e.target.value, 10));
  };

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleClickIcon = (index: number) => {
    const inputRef = fileInputRef.current[index];
    if (inputRef) {
      inputRef.click();
    }
  };
  const removeInstruction = (index: number) => {
    const updatedInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(updatedInstructions);
  };

  const toggleCourse = (label: string, event: any) => {
    event.preventDefault();
    setCourse((prevCourses) =>
      prevCourses.includes(label)
        ? prevCourses.filter((course) => course !== label)
        : [...prevCourses, label.toLocaleLowerCase()]
    );
    console.log(course);
  };

  const selectDifficulty = (label: string, event: any) => {
    event.preventDefault();
    setDifficulty(label.toLocaleLowerCase());
    console.log(difficulty);
  };

  const toggleDietary = (label: string, event: any) => {
    event.preventDefault();
    setDietary((prevDietary) =>
      prevDietary.includes(label)
        ? prevDietary.filter((dietary) => dietary !== label)
        : [...prevDietary, label.toLocaleLowerCase()]
    );
    console.log(dietary);
  };

  const validateData = async () => {
    try {
      await validationSchema.validate(
        {
          title,
          about,
          images,
          hashtags,
          timeToTake,
          servings,
          ingredients,
          instructions,
        },
        { abortEarly: false }
      );
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  useEffect(() => {
    validateData();
  }, [
    title,
    about,
    images,
    hashtags,
    timeToTake,
    servings,
    ingredients,
    instructions,
  ]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setAbout(post.about);
      setImages(post.images);
      setHashtags(post.hashtags);
      setTimeToTake(post.timeToTake);
      setServings(post.servings);
      setIngredients(post.ingredients);
      setInputFields(post.ingredients);
      setInstructions(post.instructions);
      setDifficulty(post.difficulty);
      setCourse(post.course);
      setDietary(post.dietary);
      setIsBasicTabValid(true);
      setIsRecipeTabValid(true);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = await validateData();

    if (isValid) {
      try {
        await onSubmit(
          title,
          about,
          images,
          hashtags,
          Number(timeToTake),
          servings,
          ingredients,
          instructions,
          difficulty,
          course,
          dietary,
          isEditing,
          post?.id
        );
        setTitle("");
        setAbout("");
        setImages([]);
        setInputFields([{ name: "", quantity: "" }]);
        setIngredients([]);
        setInstructions([{ description: "", image: "" }]);
        setTimeToTake("");
        setServings(0);
        setHashtags([]);
        setDifficulty("");
        setCourse([]);
        setDietary([]);
        setNewHashtag("");
        setActiveTab(0);
      } catch (err) {
        error(
          "Error during submit: " + ((err as Error)?.message || "Unknown error")
        );
      }
    } else {
      error("Invalid data. Please check your input fields", validationErrors);
    }
  };
  const handleClick = () => {
    if (imgRef.current) {
      imgRef.current.click();
    }
  };

  const handlePreviousTab = (event: any) => {
    event.preventDefault();
    setActiveTab(activeTab - 1);
  };
  const handleNextTab = (event: any) => {
    event.preventDefault();
    setActiveTab(activeTab + 1);
  };
  if (!isOpen) return null;

  return (
    <div className="inset-0 flex items-start justify-center">
      <Toaster />
      <div className="modal-overlay fixed inset-0 bg-black opacity-40"></div>
      <div className="responsive modal-content absolute top-0 bg-white p-6 rounded-lg w-full max-w-lg z-50 overflow-y-auto max-h-[800px]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>
        <div className="tabs tabs-boxed mt-6" role="tablist">
          <a
            role="tab"
            className={`tab tab-lifted ${
              activeTab === 0 ? "tab-active active-tab" : ""
            }`}
            onClick={() => setActiveTab(0)}
          >
            Basic
          </a>
          <a
            role="tab"
            className={`tab tab-lifted ${
              activeTab === 1 ? "tab-active active-tab" : ""
            }`}
            onClick={() => setActiveTab(1)}
          >
            Recipe
          </a>
          <a
            role="tab"
            className={`tab tab-lifted ${
              activeTab === 2 ? "tab-active active-tab" : ""
            }`}
            onClick={() => setActiveTab(2)}
          >
            Hashtags
          </a>
        </div>
        <form
          className="flex flex-col gap-4 w-full mt-4"
          onSubmit={handleSubmit}
        >
          {activeTab === 0 && (
            <BasicInfoTab
              title={title}
              setTitle={setTitle}
              about={about}
              setAbout={setAbout}
              images={images}
              imgRef={imgRef}
              handleClick={handleClick}
              handleImgChange={handleImgChange}
              removeImage={removeImage}
              hashtags={hashtags}
              newHashtag={newHashtag}
              isSubmitting={isSubmitting}
              addHashtag={addHashtag}
              setNewHashtag={setNewHashtag}
              setHashtags={setHashtags}
              removeHashtag={removeHashtag}
              currentIndex={currentIndex}
              goToPrevious={goToPrevious}
              goToNext={goToNext}
              post={post}
              setIsBasicTabValid={setIsBasicTabValid}
            />
          )}
          {activeTab === 1 && (
            <RecipeDetailsTab
              timeToTake={timeToTake}
              servings={servings}
              inputFields={inputFields}
              setInputFields={setInputFields}
              setInstructions={setInstructions}
              instructions={instructions}
              handleTimeToTake={handleTimeToTake}
              handleServings={handleServings}
              handleInputChange={handleInputChange}
              handleRemoveInputField={handleRemoveInputField}
              handleAddInputField={handleAddInputField}
              setIngredients={setIngredients}
              handleInstructionChange={handleInstructionChange}
              handleImageChange={handleImageChange}
              addInstruction={addInstruction}
              isSubmitting={isSubmitting}
              fileInputRef={fileInputRef}
              handleClickIcon={handleClickIcon}
              removeImageInstruction={removeImageInstruction}
              removeInstruction={removeInstruction}
              setIsRecipeTabValid={setIsRecipeTabValid}
            />
          )}
          {activeTab === 2 && (
            <HashtagTab
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              course={course}
              setCourse={setCourse}
              dietary={dietary}
              setDietary={setDietary}
              toggleCourse={toggleCourse}
              selectDifficulty={selectDifficulty}
              toggleDietary={toggleDietary}
            />
          )}
          <div className="flex justify-between mt-4">
            <button
              className={`btn py-2 px-4 ${
                activeTab === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePreviousTab}
              disabled={activeTab === 0}
            >
              Previous
            </button>

            <button
              className="btn py-2 px-4"
              onClick={handleNextTab}
              disabled={activeTab === 2}
            >
              Next
            </button>
          </div>
          {activeTab === 2 && (
            <button
              type="submit"
              disabled={isSubmitting || !isBasicTabValid ||
                !isRecipeTabValid || Object.keys(validationErrors).length !== 0}
              className="btn bg-red-500 w-full text-white mt-6 font-semibold"
            >
              {post ? "EDIT POST" : "POST NOW"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
