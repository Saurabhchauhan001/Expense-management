"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Modal } from "../../../components/ui/modal";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Calendar, Tag, User, Filter, ArrowUpDown } from "lucide-react";

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

  // Filter & Sort State
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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
      fetchDues();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Derive filtered and sorted dues
  const getFilteredAndSortedDues = () => {
    let result = [...dues];
    if (filterType !== "all") {
      result = result.filter(d => d.type === filterType);
    }
    
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      if (sortBy === "oldest") return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
      if (sortBy === "highest") return Number(b.amount) - Number(a.amount);
      if (sortBy === "lowest") return Number(a.amount) - Number(b.amount);
      return 0;
    });
    
    return result;
  };

  const filteredDues = getFilteredAndSortedDues();

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

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border border-border backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-background/50 px-3 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="due">Due</option>
            <option value="borrowed">Borrowed</option>
            <option value="payable">Payable</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-background/50 px-3 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Display dues */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading transactions...</div>
      ) : filteredDues.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 bg-card/30 rounded-xl border border-border border-dashed">
          No transactions found for the selected filter.
        </div>
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredDues.map((due) => (
              <motion.div
                key={due._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="flex flex-col justify-between h-full glass-card hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{due.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3" /> {due.category}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${due.status === "Paid" ? "bg-green-500/20 text-green-500 border border-green-500/20" : "bg-orange-500/20 text-orange-500 border border-orange-500/20"}`}>
                        {due.status || "Pending"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">₹{due.amount}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                          due.type === 'expense' ? 'bg-red-500/10 text-red-500' : 
                          due.type === 'income' ? 'bg-green-500/10 text-green-500' : 
                          'bg-secondary text-secondary-foreground'
                        }`}>
                          {due.type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(due.borrowedDate || due.createdAt || due.date).toLocaleDateString()}
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

                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(due)} className="glass-card-hover">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {due.status !== "Paid" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => markAsPaid(due._id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => deleteDue(due._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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