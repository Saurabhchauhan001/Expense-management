import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../../../lib/mongodb";
import Budget from "../../../../../models/Budget";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { category, planned, actual } = await req.json();

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // 🟢 Find the budget document first
    const budget = await Budget.findOne({ _id: id, userEmail: session.user.email });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // 🟢 Check if category already exists; if yes, update it; else push new one
    const existingIndex = budget.categories.findIndex(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );

    if (existingIndex > -1) {
      budget.categories[existingIndex].planned = planned || 0;
      budget.categories[existingIndex].actual = actual || 0;
    } else {
      budget.categories.push({
        category,
        planned: planned || 0,
        actual: actual || 0,
      });
    }

    budget.updatedAt = new Date();
    await budget.save();

    const plainBudget = budget.toObject();
    return NextResponse.json(plainBudget, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id]/category error:", err);
    return NextResponse.json(
      { error: "Failed to update category", details: err.message },
      { status: 500 }
    );
  }
}