import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../lib/mongodb";
import Budget from "../../../models/Budget";
import { authOptions } from "../auth/[...nextauth]/route";

// POST /api/budgets => create budget
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const { name, type, totalBudget, categories } = data;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Budget name is required and must be a string." }, { status: 400 });
    }
    const newBudget = await Budget.create({
      userEmail: session.user.email,
      name: name.trim(),
      type: type || "Event",
      totalBudget: typeof totalBudget === "number" ? totalBudget : 0,
      categories: categories || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json(newBudget, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create budget", details: err.message }, { status: 500 });
  }
}

// GET /api/budgets => fetch all budgets for user
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Please log in to view budgets." }, { status: 401 });
    }
    const budgets = await Budget.find({ userEmail: session.user.email }).sort({ updatedAt: -1 });
    return NextResponse.json({ budgets }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch budgets", details: err.message }, { status: 500 });
  }
}
