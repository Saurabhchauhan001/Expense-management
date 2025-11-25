"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Calendar, Tag, User } from "lucide-react";

export default function DuesPage() {
  const { data: session } = useSession();
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    borrowedDate: "",
    dueDate: "",
    notes: "",
    type: "due",
    date: new Date().toISOString(),
  });

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDueId, setEditingDueId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    notes: "",
  });

  // 🟢 Edit due
  const handleEditDue = async (e) => {
    e.preventDefault();
    if (!editingDueId) return;
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingDueId,
          updates: {
            amount: editForm.amount,
            notes: editForm.notes,
          },
        }),
      });
      if (res.ok) {
        setEditingDueId(null);
        setIsEditModalOpen(false);
        setEditForm({ amount: "", notes: "" });
        fetchDues();
      }
    } catch (error) {
      console.error("Edit due error:", error);
    }
  };

  const openEditModal = (due) => {
    setEditingDueId(due._id);
    setEditForm({
      amount: due.amount,
      notes: due.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // 🟢 Fetch dues from API
  useEffect(() => {
    if (session) fetchDues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(
          (item) =>
            item.userEmail &&
            session?.user?.email &&
            item.userEmail === session.user.email
        );
        setDues(filtered);
      } else {
        setDues([]);
      }
    } catch (error) {
      console.error("Failed to load dues:", error);
      setDues([]);
    } finally {
      setLoading(false);
    }
  };

  // 🟡 Add new due
  const handleAddDue = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        type: (formData.type || "due").toLowerCase().trim(),
        date: new Date().toISOString(),
        userEmail: session?.user?.email,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (res.ok) {
        setFormData({
          name: "",
          category: "",
          amount: "",
          borrowedDate: "",
          dueDate: "",
          notes: "",
          type: "due",
          date: new Date().toISOString(),
        });
        fetchDues();
      } else {
        const errorData = await res.json();
        console.error("Add due API error:", errorData);
      }
    } catch (error) {
      console.error("Add due error:", error);
    }
  };

  // 🟠 Mark as paid
  const markAsPaid = async (id) => {
    try {
      await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: { status: "Paid" } }),
      });
      fetchDues();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // 🔴 Delete due
  const deleteDue = async (id) => {
    try {
      await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchDues();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (!session)
    return (
      <div className="flex justify-center items-center h-screen text-destructive text-xl">
        Please sign in to manage your transactions.
      </div>
    );

  return (
    <div className="container-custom py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      {/* Add New Due Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDue} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              type="text"
              placeholder="Person / Shop Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="due">Due</option>
              <option value="borrowed">Borrowed</option>
              <option value="payable">Payable</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <Input
              type="date"
              placeholder="Start date"
              value={formData.borrowedDate}
              onChange={(e) => setFormData({ ...formData, borrowedDate: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="Due date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="md:col-span-2"
            />
            <Button type="submit" className="md:col-span-4">
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display dues */}
      {loading ? (
        <div className="text-center text-muted-foreground">Loading transactions...</div>
      ) : dues.length === 0 ? (
        <div className="text-center text-muted-foreground">No transactions found. Add your first one!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dues.map((due) => (
            <Card key={due._id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{due.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Tag className="h-3 w-3" /> {due.category}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${due.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {due.status || "Pending"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">₹{due.amount}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                      {due.type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(due.borrowedDate || due.createdAt).toLocaleDateString()}
                    </p>
                    {due.dueDate && (
                      <p className="flex items-center gap-2 text-destructive">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(due.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {due.notes && <p className="text-xs italic mt-2">"{due.notes}"</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(due)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {due.status !== "Paid" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markAsPaid(due._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDue(due._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
      >
        <form onSubmit={handleEditDue} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Amount</label>
            <Input
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <Input
              type="text"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}