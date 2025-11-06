import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const recentTransactions = await Transaction.find({
  userEmail: session.user.email,
  
})
  .sort({ createdAt: -1 })
  .limit(5);

    return NextResponse.json(recentTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}