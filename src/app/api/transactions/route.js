import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch all transactions for the logged-in user
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await Transaction.find({ userEmail: session.user.email }).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 });
  }
}

// POST: Add a new transaction
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    console.log("Incoming transaction data:", data);

    // Normalize the type
    if (data.type) {
      data.type = data.type.toString().toLowerCase().trim();
    }

    const newTransaction = await Transaction.create({ ...data, userEmail: session.user.email });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to add transaction", details: error.message }, { status: 500 });
  }
}

// PUT: Update a transaction by ID
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });

    const updatedTransaction = await Transaction.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction", details: error.message }, { status: 500 });
  }
}

// DELETE: Remove a transaction by ID
export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction", details: error.message }, { status: 500 });
  }
}
