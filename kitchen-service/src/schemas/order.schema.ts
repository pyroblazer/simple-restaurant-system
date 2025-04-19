import { Schema } from 'mongoose';

export const OrderSchema = new Schema(
  {
    customerEmail: { type: String, required: true },
    menuItems: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ['Pending', 'Processed'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);
