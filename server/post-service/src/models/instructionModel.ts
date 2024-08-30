import { model, Schema } from "mongoose";

export const InstructionSchema = new Schema({
  step: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const InstructionModel = model("Instruction", InstructionSchema);
export default InstructionModel;
