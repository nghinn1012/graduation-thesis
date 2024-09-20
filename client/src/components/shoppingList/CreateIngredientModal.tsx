import { useState } from "react";
import { ingredientOfListSchema } from "../../api/post";

const parseIngredients = (input: string) => {
  const lines = input
    .trim()
    .split('\n')
    .map(line => line.replace(/^-/, '').trim())
    .filter(line => line.length > 0);

  const ingredients = lines.flatMap(line => {
    const firstDigitIndex = line.search(/\d/);

    if (firstDigitIndex === 0) {
      const quantityEndIndex = line.search(/\D/);
      const nameStartIndex = line.indexOf(' ', quantityEndIndex);
      const quantity = line.slice(0, nameStartIndex).trim();
      const name = line.slice(nameStartIndex).trim();

      if (!name && !quantity) return [];
      return { name, quantity };
    }

    const parts = line.split(':').map(part => part.trim());

    if (parts.length === 2) {
      const name = parts[0].trim();
      const quantity = parts[1].trim();

      if (!name && !quantity) return [];
      return { name, quantity };
    }

    return { name: line.trim(), quantity: '1' };
  });

  return ingredients;
};


const CreateIngredientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredients: ingredientOfListSchema[]) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    const ingredients = parseIngredients(input);
    console.log(ingredients);
    if (ingredients.length > 0) {
      onSave(ingredients);
      setInput("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-2">Add Ingredients</h2>
        <textarea
          placeholder="Enter ingredients and quantities, one per line (e.g., 'Oil 1 tbsp')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea textarea-bordered w-full mb-2"
          rows={5}
        />
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn btn-success mr-2">
            Save
          </button>
          <button onClick={onClose} className="btn btn-error">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateIngredientModal;
