import { useState } from "react";
import { ingredientOfListSchema } from "../../api/post";
import { useI18nContext } from "../../hooks/useI18nContext";

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

    if (line.includes(':')) {
      const parts = line.split(':').map(part => part.trim());
      const name = parts[0].trim();
      const quantity = parts[1].trim();

      if (!name && !quantity) return [];
      return { name, quantity };
    }

    const matches = line.match(/^(.+?)\s(\d+.+)$/);
    if (matches) {
      const [_, name, quantity] = matches;
      return { name: name.trim(), quantity: quantity.trim() };
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
  const languageContext = useI18nContext();
  const lang = languageContext.of("ShoppingList");

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
        <h2 className="text-lg font-bold mb-2">{lang("add-ingredients")}</h2>
        <textarea
          placeholder={lang("add-placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea textarea-bordered w-full mb-2"
          rows={5}
        />
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn btn-success mr-2">
            {lang("save")}
          </button>
          <button onClick={onClose} className="btn btn-error">
            {lang("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateIngredientModal;
