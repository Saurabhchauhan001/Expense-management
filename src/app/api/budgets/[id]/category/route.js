import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../../../lib/mongodb";
import Budget from "../../../../../models/Budget";
import { authOptions } from "../../../auth/[...nextauth]/route";

// PUT /api/budgets/[id]/category
export async function PUT(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const { category, planned, actual } = await req.json();
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Category name required." },
        { status: 400 }
      );
    }

    const plannedNum = typeof planned === "number" ? planned : 0;
    const actualNum = typeof actual === "number" ? actual : 0;

    const budget = await Budget.findOne({ _id: id, userEmail: session.user.email });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    const catIdx = budget.categories.findIndex((c) => c.category === category);

    if (catIdx > -1) {
      budget.categories[catIdx].planned = plannedNum;
      budget.categories[catIdx].actual = actualNum;
    } else {
      budget.categories.push({
        category,
        planned: plannedNum,
        actual: actualNum,
      });
    }

    budget.updatedAt = new Date();
    await budget.save();

    return NextResponse.json(budget, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id]/category error:", err);
    return NextResponse.json(
      { error: "Failed to update category", details: err.message },
      { status: 500 }
    );
  }
}
