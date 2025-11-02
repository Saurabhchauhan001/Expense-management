import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../../lib/mongodb";
import Budget from "../../../../models/Budget";
import { authOptions } from "../../auth/[...nextauth]/route";

// ✅ Fetch a single budget
export async function GET(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const budget = await Budget.findOne({
      _id: id,
      userEmail: session.user.email,
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(budget, { status: 200 });
  } catch (err) {
    console.error("GET /api/budgets/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch budget", details: err.message },
      { status: 500 }
    );
  }
}

// ✅ Safe Update Budget (Preserves Existing Categories)
export async function PUT(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const patch = await req.json();

    const existing = await Budget.findOne({ _id: id, userEmail: session.user.email });
    if (!existing) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      {
        $set: {
          name: patch.name ?? existing.name,
          type: patch.type ?? existing.type,
          totalBudget: patch.totalBudget ?? existing.totalBudget,
          categories: patch.categories ?? existing.categories,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedBudget, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update budget", details: err.message },
      { status: 500 }
    );
  }
}