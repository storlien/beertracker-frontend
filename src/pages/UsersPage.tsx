import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { Plus, Trash2, Edit3, CreditCard, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    cards: "",
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ firstName: "", lastName: "", cards: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));
    });
    return () => unsub();
  }, []);

  const parseCards = (raw: string) =>
    raw
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length === 10);

  const handleAdd = async () => {
    if (!newForm.firstName || !newForm.lastName) {
      toast.error("First name and last name are required");
      return;
    }
    try {
      await addDoc(collection(db, "users"), {
        firstName: newForm.firstName,
        lastName: newForm.lastName,
        cards: parseCards(newForm.cards),
      });
      toast.success("User added. Card links will sync on next migration.");
      setNewForm({ firstName: "", lastName: "", cards: "" });
      setShowAdd(false);
    } catch (err: any) {
      toast.error("Failed to add user: " + (err.message || String(err)));
      console.error("Add user error:", err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        cards: parseCards(editForm.cards),
      });
      toast.success("User updated. Card links will sync on next migration.");
      setEditing(null);
    } catch (err: any) {
      toast.error("Failed to update user: " + (err.message || String(err)));
      console.error("Update user error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("User deleted. Card links will sync on next migration.");
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
            <Users className="w-5 h-5" />
          </span>
          Users
        </h1>
        {isAdmin && (
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="First name"
                value={newForm.firstName}
                onChange={(e) =>
                  setNewForm({ ...newForm, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last name"
                value={newForm.lastName}
                onChange={(e) =>
                  setNewForm({ ...newForm, lastName: e.target.value })
                }
              />
              <Input
                placeholder="Cards (comma-separated 10-digit)"
                value={newForm.cards}
                onChange={(e) =>
                  setNewForm({ ...newForm, cards: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAdd}>Save</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cards</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {editing === user.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editForm.firstName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-24 h-8"
                        />
                        <Input
                          value={editForm.lastName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-24 h-8"
                        />
                      </div>
                    ) : (
                      `${user.firstName} ${user.lastName}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === user.id ? (
                      <Input
                        value={editForm.cards}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            cards: e.target.value,
                          })
                        }
                        className="w-full h-8 font-mono"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.cards.map((c) => (
                          <Button
                            key={c}
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/cards/${c}`)}
                            className="h-7 px-2 text-xs font-mono"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {c.slice(0, 6)}****
                          </Button>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-2">
                        {editing === user.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(user.id)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditing(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditing(user.id);
                                setEditForm({
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  cards: user.cards.join(", "),
                                });
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
