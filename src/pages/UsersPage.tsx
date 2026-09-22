import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { Plus, Trash2, Edit3, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { User } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", cards: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ firstName: "", lastName: "", cards: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newForm.firstName || !newForm.lastName) {
      toast.error("First name and last name are required");
      return;
    }
    const newCards = newForm.cards
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length === 10);
    try {
      const docRef = await addDoc(collection(db, "users"), {
        firstName: newForm.firstName,
        lastName: newForm.lastName,
        cards: newCards,
      });

      // Link cards to new user
      const batch = writeBatch(db);
      newCards.forEach((c) => {
        const ref = doc(db, "cards", c);
        batch.update(ref, { linkedUserId: docRef.id });
      });
      await batch.commit();

      toast.success("User added");
      setNewForm({ firstName: "", lastName: "", cards: "" });
      setShowAdd(false);
    } catch (err: any) {
      toast.error("Failed to add user: " + (err.message || String(err)));
      console.error("Add user error:", err);
    }
  };

  const handleUpdate = async (id: string) => {
    const newCards = editForm.cards
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length === 10);

    // Get old cards to unlink
    const oldCards = users.find((u) => u.id === id)?.cards || [];

    try {
      // Update user document
      await updateDoc(doc(db, "users", id), {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        cards: newCards,
      });

      // Update card links: remove old, add new
      const batch = writeBatch(db);

      // Unlink cards that no longer belong
      oldCards.forEach((c) => {
        if (!newCards.includes(c)) {
          const ref = doc(db, "cards", c);
          batch.update(ref, { linkedUserId: "" });
        }
      });

      // Link new cards
      newCards.forEach((c) => {
        const ref = doc(db, "cards", c);
        batch.update(ref, { linkedUserId: id });
      });

      await batch.commit();
      toast.success("User updated");
      setEditing(null);
    } catch (err: any) {
      toast.error("Failed to update user: " + (err.message || String(err)));
      console.error("Update user error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const user = users.find((u) => u.id === id);
    const cards = user?.cards || [];

    try {
      await deleteDoc(doc(db, "users", id));

      // Unlink all cards
      const batch = writeBatch(db);
      cards.forEach((c) => {
        const ref = doc(db, "cards", c);
        batch.update(ref, { linkedUserId: "" });
      });
      await batch.commit();

      toast.success("User deleted");
    } catch (err: any) {
      toast.error("Failed to delete user: " + (err.message || String(err)));
      console.error("Delete user error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 text-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
          </span>
          Users
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-medium">New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="First name"
              value={newForm.firstName}
              onChange={(e) => setNewForm({ ...newForm, firstName: e.target.value })}
              className="px-3 py-2 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Last name"
              value={newForm.lastName}
              onChange={(e) => setNewForm({ ...newForm, lastName: e.target.value })}
              className="px-3 py-2 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Cards (comma-separated 10-digit)"
              value={newForm.cards}
              onChange={(e) => setNewForm({ ...newForm, cards: e.target.value })}
              className="px-3 py-2 bg-background border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
        </div>
      )}

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-text-muted">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Cards</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium">
                    {editing === user.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-24 px-2 py-1 bg-background border border-border rounded text-sm"
                        />
                        <input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-24 px-2 py-1 bg-background border border-border rounded text-sm"
                        />
                      </div>
                    ) : (
                      `${user.firstName} ${user.lastName}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === user.id ? (
                      <input
                        value={editForm.cards}
                        onChange={(e) => setEditForm({ ...editForm, cards: e.target.value })}
                        className="w-full px-2 py-1 bg-background border border-border rounded text-sm font-mono"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.cards.map((c) => (
                          <button
                            key={c}
                            onClick={() => navigate(`/cards/${c}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-surface-hover border border-border rounded hover:border-primary transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            {c.slice(0, 6)}****
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-2">
                        {editing === user.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(user.id)}
                              className="p-1 bg-primary/20 text-primary rounded hover:bg-primary/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="p-1 text-text-muted hover:text-text"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditing(user.id);
                                setEditForm({
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  cards: user.cards.join(", "),
                                });
                              }}
                              className="p-1 text-text-muted hover:text-primary"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 text-text-muted hover:text-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
