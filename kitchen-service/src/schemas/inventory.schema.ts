import { Schema } from 'mongoose';

export const InventorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true },
);
