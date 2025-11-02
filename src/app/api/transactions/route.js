import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await Transaction.find({ userEmail: session.user.email }).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Incoming transaction data:", data);

    data.type = data.type?.toString().toLowerCase().trim();

    const newTransaction = await Transaction.create({
      ...data,
      userEmail: session.user.email,
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { id, updates } = await req.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }

    const updated = await Transaction.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}