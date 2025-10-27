import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense", "due", "borrowed", "payable"],
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    amount: { type: Number, required: true, min: 0 },
    personOrEntity: { type: String, default: "" }, // who the due/borrowed is with
    borrowedDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Partially Paid", "Overdue"],
      default: "Pending",
    },
    date: { type: Date, required: true, default: Date.now },
    userEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;