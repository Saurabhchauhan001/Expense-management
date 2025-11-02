"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

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
  // For edit feature
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
        setEditForm({ amount: "", notes: "" });
        fetchDues();
      }
    } catch (error) {
      console.error("Edit due error:", error);
    }
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
        // Filter all transactions for logged-in user regardless of type
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
      // Normalize type and set date
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
        // Refresh the dues list after adding new due
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
      <div className="flex justify-center items-center h-screen text-gray-600 text-xl">
        Please sign in to manage your dues.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Dues & Payables</h1>

      {/* Add New Due Form */}
      <form
        onSubmit={handleAddDue}
        className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-2 gap-4"
      >
        <input
          type="text"
          placeholder="Person / Shop Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          placeholder="Start date"
          value={formData.borrowedDate}
          onChange={(e) => setFormData({ ...formData, borrowedDate: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border p-2 rounded col-span-2"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="due">Due</option>
          <option value="borrowed">Borrowed</option>
          <option value="payable">Payable</option>
        </select>
        <Button type="submit" className="col-span-2 bg-teal-600 hover:bg-teal-700">
          Add Due
        </Button>
      </form>

      {/* Display dues */}
      {loading ? (
        <div className="text-center text-gray-500">Loading dues...</div>
      ) : dues.length === 0 ? (
        <div className="text-center text-gray-500">No dues found. Add your first one!</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {dues.map((due) => (
            <Card key={due._id} className="p-4 shadow-lg border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-teal-700">{due.name}</h2>
                  <p className="text-sm text-gray-600">{due.category}</p>
                  <p className="text-lg font-bold text-amber-500 mt-1">₹{due.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      due.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {due.status}
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {due.type ? due.type.charAt(0).toUpperCase() + due.type.slice(1) : ""}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Borrowed: {new Date(due.borrowedDate).toLocaleDateString()}
              </p>
              {due.dueDate && (
                <p className="text-gray-500 text-sm">
                  Due: {new Date(due.dueDate).toLocaleDateString()}
                </p>
              )}
              {due.notes && <p className="mt-2 text-gray-700">{due.notes}</p>}

              {/* Edit form (inline/modal style) */}
              {editingDueId === due._id ? (
                <form
                  onSubmit={handleEditDue}
                  className="bg-gray-100 border border-gray-300 rounded p-3 mt-2 flex flex-col gap-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      className="border p-2 rounded flex-1"
                      placeholder="Amount"
                      required
                    />
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="border p-2 rounded flex-1"
                      placeholder="Notes"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                      onClick={() => {
                        setEditingDueId(null);
                        setEditForm({ amount: "", notes: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    onClick={() => {
                      setEditingDueId(due._id);
                      setEditForm({
                        amount: due.amount,
                        notes: due.notes || "",
                      });
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </Button>
                  {due.status !== "Paid" && (
                    <Button
                      onClick={() => markAsPaid(due._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Mark as Paid
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteDue(due._id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}