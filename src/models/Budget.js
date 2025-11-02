import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  planned: { type: Number, default: 0 },
  actual: { type: Number, default: 0 },
});

const BudgetSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: "Event" },
  totalBudget: { type: Number, default: 0 },
  categories: { type: [CategorySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);