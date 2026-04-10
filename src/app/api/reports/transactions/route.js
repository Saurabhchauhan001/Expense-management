

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user and filter
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";
    const month = searchParams.get("month"); // expected format: "YYYY-MM"
    const userEmail = session.user.email;

    // Fetch all transactions
    let transactions = await Transaction.find({ userEmail }).sort({ date: -1 });

    if (month) {
      transactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const yyyy = txDate.getFullYear();
        const mm = String(txDate.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}` === month;
      });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: "No transactions found" }, { status: 404 });
    }

    // Dynamically import jspdf-autotable
    const { default: autoTable } = await import("jspdf-autotable");

    // Initialize PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Expense Management - Transaction Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${month ? month : period}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((tx) => {
      if (tx.type === "Income" || tx.type === "income") totalIncome += tx.amount;
      else if (tx.type === "Expense" || tx.type === "expense") totalExpense += tx.amount;
    });

    const netSavings = totalIncome - totalExpense;

    // Summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 50);
    doc.setFontSize(12);
    doc.text(`Total Income: ₹${totalIncome}`, 14, 58);
    doc.text(`Total Expenses: ₹${totalExpense}`, 14, 65);
    doc.text(`Net Savings: ₹${netSavings}`, 14, 72);

    // Transactions Table
    const tableData = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.title || "-",
      tx.category || "-",
      tx.type,
      `₹${tx.amount}`,
      tx.status || "—",
    ]);

    autoTable(doc, {
      startY: 85,
      head: [["Date", "Title", "Category", "Type", "Amount", "Status"]],
      body: tableData,
    });

    // Create a PDF buffer
    const pdfOutput = doc.output("arraybuffer");

    return new NextResponse(Buffer.from(pdfOutput), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Transaction_Report_${period}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json({ error: "Failed to generate transaction report" }, { status: 500 });
  }
}