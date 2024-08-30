import { model, Schema } from "mongoose";

const InstructionSchema = new Schema({
  stepNumber: {
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
