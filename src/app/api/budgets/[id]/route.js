import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../../lib/mongodb";
import Budget from "../../../../models/Budget";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/budgets/[id] (get single budget)
export async function GET(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;

    const budget = await Budget.findOne({ _id: id, userEmail: session.user.email });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget }, { status: 200 });
  } catch (err) {
    console.error("GET /api/budgets/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch budget", details: err.message },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[id] (update budget details)
export async function PUT(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;

    const data = await req.json();
    const { name, type, totalBudget } = data;

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget;
    updateData.updatedAt = new Date();

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
      updateData,
      { new: true }
    );

    if (!updatedBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget: updatedBudget }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update budget", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] (delete budget)
export async function DELETE(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;

    const deleted = await Budget.findOneAndDelete({ _id: id, userEmail: session.user.email });

    if (!deleted) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/budgets/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete budget", details: err.message },
      { status: 500 }
    );
  }
}
