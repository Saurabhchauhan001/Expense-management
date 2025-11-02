import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { jsPDF } from "jspdf";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const budget = await Budget.findById(id);

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const { default: autoTable } = await import("jspdf-autotable");

    // Initialize PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Expense Management - Budget Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Budget Name: ${budget.name}`, 14, 30);
    doc.text(`Budget Type: ${budget.type}`, 14, 37);
    doc.text(`Total Budget: ₹${budget.totalBudget}`, 14, 44);
    doc.text(`Created: ${new Date(budget.createdAt).toLocaleDateString()}`, 14, 51);

    // Calculate totals
    let totalPlanned = 0;
    let totalActual = 0;
    budget.categories.forEach((cat) => {
      totalPlanned += cat.planned || 0;
      totalActual += cat.actual || 0;
    });
    const remaining = budget.totalBudget - totalActual;

    // Summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 65);
    doc.setFontSize(12);
    doc.text(`Total Planned: ₹${totalPlanned}`, 14, 72);
    doc.text(`Total Actual: ₹${totalActual}`, 14, 79);
    doc.text(`Remaining: ₹${remaining}`, 14, 86);

    // Category Table
    const tableData = budget.categories.map((cat) => [
      cat.name || "-",
      `₹${cat.planned || 0}`,
      `₹${cat.actual || 0}`,
      `${cat.planned ? Math.round((cat.actual / cat.planned) * 100) : 0}%`,
    ]);

    autoTable(doc, {
      startY: 100,
      head: [["Category", "Planned", "Actual", "Utilization (%)"]],
      body: tableData,
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY);

    // Create PDF buffer
    const pdfOutput = doc.output("arraybuffer");

    return new NextResponse(Buffer.from(pdfOutput), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Budget_Report_${budget.name}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating budget PDF:", error);
    return NextResponse.json({ error: "Failed to generate budget report" }, { status: 500 });
  }
}
