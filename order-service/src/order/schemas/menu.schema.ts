import { Schema } from 'mongoose';

export const MenuSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});
