import React, { useState, useRef } from "react";
import { IoCloseSharp } from "react-icons/io5";
import BasicInfoTab from "./BasicInfoTab";
import RecipeDetailsTab from "./RecipeDetailsTab";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    about: string,
    images: string[],
    timeToTake: number,
    servings: number,
    ingredients: { name: string; quantity: string }[],
    instructions: {
      description: string;
      image?: string;
    }[]
  ) => void;
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
    { name: string; quantity: string }[]
  >([]);

  const [inputFields, setInputFields] = useState<
    { name: string; quantity: string }[]
  >([{ name: "", quantity: "" }]);

  const [instructions, setInstructions] = useState<
    {
      description: string;
      image?: string;
    }[]
  >([{ description: "", image: "" }]);

  const [timeToTake, setTimeToTake] = useState<number>(0);
  const [servings, setServings] = useState<number>(0);

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

  const handleImageChange = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedInstructions = instructions.map((instruction, i) =>
          i === index
            ? { ...instruction, image: reader.result as string }
            : instruction
        );
        setInstructions(updatedInstructions);
      };
      reader.readAsDataURL(file);
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

  const handleRemoveInputField = (index: number) => {
    const newInputFields = [...inputFields];
    newInputFields.splice(index, 1);
    setInputFields(newInputFields);
  };

  const handleTimeToTake = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeToTake(parseInt(e.target.value));
  };

  const handleServings = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServings(parseInt(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(
      title,
      about,
      images,
      timeToTake,
      servings,
      ingredients,
      instructions
    );
    setTitle("");
    setAbout("");
    setImages([]);
    setInputFields([{ name: "", quantity: "" }]);
    setIngredients([]);
    setInstructions([{ description: "", image: "" }]);
    setTimeToTake(0);
    setServings(0);
  };

  const handleClick = () => {
    if (imgRef.current) {
      imgRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inset-0 flex items-start justify-center z-50">
      <div className="modal-overlay fixed inset-0 bg-black opacity-40"></div>
      <div className="responsive modal-content absolute top-0 bg-white p-6 rounded-lg w-full max-w-lg z-60 overflow-y-auto max-h-[800px]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>
        <div className="tabs tabs-boxed mt-6" role="tablist">
          <a
            role="tab"
            className={`tab tab-lifted ${activeTab === 0 ? "tab-active" : ""}`}
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
            />
          )}
          {activeTab === 1 && (
            <RecipeDetailsTab
              timeToTake={timeToTake}
              servings={servings}
              inputFields={inputFields}
              instructions={instructions}
              handleTimeToTake={handleTimeToTake}
              handleServings={handleServings}
              handleInputChange={handleInputChange}
              handleRemoveInputField={handleRemoveInputField}
              handleAddInputField={handleAddInputField}
              handleInstructionChange={handleInstructionChange}
              handleImageChange={handleImageChange}
              addInstruction={addInstruction}
            />
          )}
          <button
            type="submit"
            className="btn bg-red-500 w-full text-white mt-6 font-semibold"
          >
            POST NOW.
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
