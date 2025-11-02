import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";

export async function GET(req) {
  try {
    await connectDB();

    // Fetch all transactions for the logged-in user (dummy email for now)
    const userEmail = "saurabhrakeshchauhan@gmail.com"; // Replace with session.user.email if using auth
    const transactions = await Transaction.find({ userEmail });

    // Compute totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySummary = {};

    transactions.forEach((tx) => {
      if (tx.type === "Income") totalIncome += tx.amount;
      if (tx.type === "Expense") totalExpense += tx.amount;

      // Category summary for pie chart
      if (tx.category) {
        if (!categorySummary[tx.category]) categorySummary[tx.category] = 0;
        categorySummary[tx.category] += tx.amount;
      }
    });

    // Convert categorySummary object → array
    const categoryData = Object.keys(categorySummary).map((key) => ({
      name: key,
      value: categorySummary[key],
    }));

    // Group transactions by week (for bar chart)
    const weeklyMap = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const week = Math.ceil(date.getDate() / 7); // simple week calculation
      if (!weeklyMap[`Week ${week}`]) weeklyMap[`Week ${week}`] = { expenses: 0, income: 0 };
      if (tx.type === "Income") weeklyMap[`Week ${week}`].income += tx.amount;
      else weeklyMap[`Week ${week}`].expenses += tx.amount;
    });

    const weeklyData = Object.keys(weeklyMap).map((week) => ({
      name: week,
      ...weeklyMap[week],
    }));

    const netSavings = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netSavings,
      categorySummary: categoryData,
      weeklyData,
    });
  } catch (error) {
    console.error("Error generating report summary:", error);
    return NextResponse.json({ error: "Failed to fetch report summary" }, { status: 500 });
  }
}