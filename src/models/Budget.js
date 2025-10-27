import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  planned: { type: Number, default: 0 },
  actual: { type: Number, default: 0 },
});

const BudgetSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["Event", "Monthly", "Weekly", "Personal"], default: "Event" },
  totalBudget: { type: Number, default: 0 },
  categories: [CategorySchema], // ✅ critical
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);