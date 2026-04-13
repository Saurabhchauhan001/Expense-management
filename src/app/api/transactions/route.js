import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Budget from "../../../models/Budget";

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

    // --- AUTO BUDGET SYNC (POST) ---
    if (newTransaction.type === 'expense' && newTransaction.category) {
      const budgets = await Budget.find({ userEmail: session.user.email });
      for (let budget of budgets) {
        let updated = false;
        budget.categories.forEach(cat => {
          if (cat.name.toLowerCase() === newTransaction.category.toLowerCase()) {
            cat.actual = (cat.actual || 0) + Number(newTransaction.amount);
            updated = true;
          }
        });
        if (updated) {
          await Budget.updateOne(
            { _id: budget._id },
            { $set: { categories: budget.categories } }
          );
        }
      }
    }

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

    const oldTransaction = await Transaction.findById(id);
    const updated = await Transaction.findByIdAndUpdate(id, updates, { new: true });

    // --- AUTO BUDGET SYNC (PUT) ---
    if (oldTransaction && oldTransaction.type === 'expense' && oldTransaction.category) {
      const oldAmount = Number(oldTransaction.amount || 0);
      const newAmount = updated.type === 'expense' ? Number(updated.amount || 0) : 0;
      const difference = newAmount - oldAmount;
      
      // Only runs if amount changed or if category changed (currently assuming category doesn't change for simplicity, or if it does, it's more complex. We handle basic amount diff here).
      if (difference !== 0 || oldTransaction.type !== updated.type) {
         const budgets = await Budget.find({ userEmail: oldTransaction.userEmail });
         for (let budget of budgets) {
           let budgetUpdated = false;
           budget.categories.forEach(cat => {
             if (cat.name.toLowerCase() === oldTransaction.category.toLowerCase()) {
               cat.actual = Math.max(0, (cat.actual || 0) + difference);
               budgetUpdated = true;
             }
           });
           if (budgetUpdated) {
             await Budget.updateOne({ _id: budget._id }, { $set: { categories: budget.categories } });
           }
         }
      }
    }

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

    const oldTransaction = await Transaction.findById(id);
    await Transaction.findByIdAndDelete(id);

    // --- AUTO BUDGET SYNC (DELETE) ---
    if (oldTransaction && oldTransaction.type === 'expense' && oldTransaction.category) {
      const budgets = await Budget.find({ userEmail: oldTransaction.userEmail });
      for (let budget of budgets) {
        let budgetUpdated = false;
        budget.categories.forEach(cat => {
          if (cat.name.toLowerCase() === oldTransaction.category.toLowerCase()) {
            cat.actual = Math.max(0, (cat.actual || 0) - Number(oldTransaction.amount || 0));
            budgetUpdated = true;
          }
        });
        if (budgetUpdated) {
          await Budget.updateOne({ _id: budget._id }, { $set: { categories: budget.categories } });
        }
      }
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}