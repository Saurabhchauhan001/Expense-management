

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { jsPDF } from "jspdf";

export async function GET(req) {
  try {
    await connectDB();

    // Extract user and filter (for now use dummy email and default to monthly)
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";
    const userEmail = "saurabhrakeshchauhan@gmail.com";

    // Fetch all transactions
    const transactions = await Transaction.find({ userEmail }).sort({ date: -1 });

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
    doc.text(`Period: ${period}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((tx) => {
      if (tx.type === "Income") totalIncome += tx.amount;
      else if (tx.type === "Expense") totalExpense += tx.amount;
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